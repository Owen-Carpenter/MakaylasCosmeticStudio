import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentReceiptEmail } from '@/lib/email';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Webhook secret for verifying the event
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ success: false, message: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get metadata from the session
    const { bookingId, userId, serviceId, date, time } = session.metadata || {};
    
    if (!bookingId || !userId || !serviceId) {
      console.error('Missing required metadata in session:', session.metadata);
      return NextResponse.json({ success: false, message: 'Missing required metadata' }, { status: 400 });
    }

    try {
      // First check if the booking already exists in a pending state
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      // 1. Retrieve service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (!serviceData) {
        throw new Error(`Service not found with ID: ${serviceId}`);
      }

      // Calculate the amount paid from Stripe (convert from cents to dollars)
      const amountPaid = session.amount_total ? session.amount_total / 100 : serviceData.price;

      if (existingBooking) {
        // If the booking exists, update it to confirmed status
        console.log('Updating existing pending booking to confirmed status:', bookingId);
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            payment_intent: session.payment_intent as string,
            amount_paid: amountPaid,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);

        if (updateError) {
          throw new Error(`Error updating booking: ${updateError.message}`);
        }
        
        console.log(`Successfully updated booking ${bookingId} to confirmed status`);
      } else {
        // If the booking doesn't exist yet (unlikely but possible), create it
        console.log('Creating new confirmed booking:', bookingId);
        
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            id: bookingId,
            user_id: userId,
            service_id: serviceId,
            service_name: serviceData.title,
            appointment_date: date,
            appointment_time: time,
            status: 'confirmed',
            payment_status: 'paid',
            payment_intent: session.payment_intent as string,
            amount_paid: amountPaid,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          throw new Error(`Error creating booking: ${insertError.message}`);
        }
      }

      // 3. Get user information for the email
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      // 4. Send payment receipt email
      if (userData?.email) {
        await sendPaymentReceiptEmail({
          email: userData.email,
          name: userData.name || 'Valued Customer',
          bookingId,
          serviceName: serviceData.title,
          date: new Date(date).toLocaleDateString(),
          time,
          amount: `$${amountPaid.toFixed(2)}`,
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return NextResponse.json({ success: false, message: 'Error processing payment' }, { status: 500 });
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ success: true });
} 