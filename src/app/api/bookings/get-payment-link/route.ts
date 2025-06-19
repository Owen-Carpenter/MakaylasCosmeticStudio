import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { SupabaseBooking } from '@/lib/supabase-bookings';
import { getBookingSuccessUrl, getBookingCancelUrl } from "@/lib/utils/url";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

// Service interface
interface Service {
  id: string;
  title: string;
  price: number;
  description?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    // Get session for authentication
    const session = await getServerSession();
    
    // Parse request body
    const { bookingId } = await req.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Validate user has access to this booking
    const userId = session?.user?.id;
    
    // Get the booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error || !booking) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }
    
    // Check if user has access to this booking
    if (userId && booking.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: "Booking is not in pending status" },
        { status: 400 }
      );
    }
    
    // Get the service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', booking.service_id)
      .single();
    
    if (serviceError || !service) {
      console.error("Error fetching service:", serviceError);
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }
    
    // Check if we already have a payment intent for this booking
    let paymentUrl = '';
    
    if (booking.payment_intent) {
      try {
        // Try to retrieve the existing session
        const existingSession = await stripe.checkout.sessions.retrieve(booking.payment_intent);
        
        // Check if the session is still valid and usable
        if (existingSession.status !== 'expired' && existingSession.url) {
          paymentUrl = existingSession.url;
        } else {
          // Session expired, create a new one
          paymentUrl = await createNewPaymentSession(booking, service);
        }
      } catch (error) {
        console.error("Error retrieving Stripe session:", error);
        // Create a new payment session if retrieving fails
        paymentUrl = await createNewPaymentSession(booking, service);
      }
    } else {
      // No existing payment intent, create a new one
      paymentUrl = await createNewPaymentSession(booking, service);
    }
    
    return NextResponse.json({
      success: true,
      paymentUrl
    });
  } catch (error) {
    console.error("Error generating payment link:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate payment link" },
      { status: 500 }
    );
  }
}

async function createNewPaymentSession(booking: SupabaseBooking, service: Service): Promise<string> {
  
  // Create a new Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: service.title || "Service Booking",
            description: `${booking.appointment_date ? new Date(booking.appointment_date).toLocaleDateString() : ""} at ${booking.appointment_time || ""}`,
          },
          unit_amount: Math.round((service.price || 99) * 100), // Stripe expects amount in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId: booking.user_id,
      serviceId: booking.service_id,
      serviceName: service.title,
      date: booking.appointment_date,
      time: booking.appointment_time,
    },
    mode: "payment",
    success_url: getBookingSuccessUrl(),
    cancel_url: getBookingCancelUrl(),
  });
  
  // Update the booking with the new payment intent
  await supabase
    .from('bookings')
    .update({
      payment_intent: stripeSession.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', booking.id);
  
  return stripeSession.url || '';
} 