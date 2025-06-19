import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { checkStripePaymentStatus } from "@/server/stripe";
import Stripe from "stripe";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    // Get user ID from request or session
    const { userId: requestUserId, bookingId } = await req.json();
    const userId = requestUserId || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Build query based on whether we're updating a specific booking or all pending bookings
    let query = supabase
      .from("bookings")
      .select("id, payment_intent, service_name, appointment_date, appointment_time")
      .eq("user_id", userId)
      .eq("status", "pending");

    if (bookingId) {
      query = query.eq("id", bookingId);
    }

    const { data: pendingBookings, error } = await query;
    
    if (error) {
      console.error("Error fetching pending bookings:", error);
      return NextResponse.json(
        { success: false, message: "Error fetching pending bookings" },
        { status: 500 }
      );
    }
    
    if (!pendingBookings || pendingBookings.length === 0) {
      // No pending bookings to update
      return NextResponse.json({
        success: true,
        message: "No pending bookings found",
        updated: 0
      });
    }

    let updatedCount = 0;
    const updatedBookings = [];
    
    // Check and update each pending booking
    for (const booking of pendingBookings) {
      try {
        if (!booking.payment_intent) {
          console.log(`Booking ${booking.id} has no payment_intent, skipping`);
          continue;
        }
        
        console.log(`Checking payment status for booking ${booking.id} with payment_intent: ${booking.payment_intent}`);
        
        // Check if payment is complete using our server-side function
        const { isComplete, stripeSession } = await checkStripePaymentStatus(booking.payment_intent);
        
        console.log(`Payment status for booking ${booking.id}: isComplete=${isComplete}`, stripeSession);
        
        if (isComplete) {
          // Get the actual amount paid from Stripe session
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
            apiVersion: "2025-03-31.basil",
          });
          const fullStripeSession = await stripe.checkout.sessions.retrieve(booking.payment_intent);
          const amountPaid = fullStripeSession.amount_total ? fullStripeSession.amount_total / 100 : 0;
          
          // Update booking to confirmed status
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              amount_paid: amountPaid,
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id);
          
          if (!updateError) {
            updatedCount++;
            updatedBookings.push({
              id: booking.id,
              service_name: booking.service_name,
              appointment_date: booking.appointment_date,
              appointment_time: booking.appointment_time
            });
            console.log(`Successfully updated booking ${booking.id} from pending to confirmed with amount $${amountPaid}`);
          } else {
            console.error(`Error updating booking ${booking.id}:`, updateError);
          }
        } else {
          console.log(`Payment for booking ${booking.id} is not yet complete on Stripe`);
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        // Continue with other bookings even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} bookings from pending to confirmed`,
      updated: updatedCount,
      updatedBookings
    });
  } catch (error) {
    console.error("Error in updatePendingStatus:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 