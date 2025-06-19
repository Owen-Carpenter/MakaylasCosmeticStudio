import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Debug logging
    console.log("Details Session state:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });

    // Get the session ID from the URL
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-03-31.basil",
    });

    // Get the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!stripeSession) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Get the booking ID from the Stripe session metadata
    const bookingId = stripeSession.metadata?.bookingId;
    const userId = stripeSession.metadata?.userId;

    if (!bookingId || !userId) {
      return NextResponse.json(
        { success: false, message: "Invalid booking data" },
        { status: 400 }
      );
    }

    // Check if user is authorized to view this booking
    // Either they are the owner of the booking, an admin, or they have the valid stripe session ID
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = userData?.role === 'admin';
    const isOwner = session?.user?.id === userId;
    
    // Allow access if: user is admin, or user is the booking owner, or they have the correct session ID
    // The fact that they have a valid sessionId from Stripe means they went through the checkout process
    const hasValidStripeSession = !!stripeSession.id;

    if (!isAdmin && !isOwner && !hasValidStripeSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the booking details from Supabase
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { success: false, message: "Error fetching booking details" },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is pending and if Stripe payment is actually complete
    let finalBooking = booking;
    if (booking.status === 'pending' && booking.payment_intent) {
      console.log(`Booking ${booking.id} is pending, checking Stripe payment status...`);
      
      try {
        // Check payment status directly
        const checkResponse = await stripe.checkout.sessions.retrieve(booking.payment_intent);
        const isPaymentComplete = checkResponse.payment_status === 'paid' || checkResponse.status === 'complete';
        
        if (isPaymentComplete) {
          console.log(`Payment is complete for booking ${booking.id}, updating status...`);
          const amountPaid = checkResponse.amount_total ? checkResponse.amount_total / 100 : booking.amount_paid;
          
          // Update the booking to confirmed status
          const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              amount_paid: amountPaid,
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id)
            .select('*')
            .single();
          
          if (!updateError && updatedBooking) {
            finalBooking = updatedBooking;
            console.log(`Successfully updated booking ${booking.id} to confirmed status`);
          } else {
            console.error(`Error updating booking ${booking.id}:`, updateError);
          }
        }
      } catch (checkError) {
        console.error(`Error checking Stripe payment status for booking ${booking.id}:`, checkError);
      }
    }

    // Return the booking details
    return NextResponse.json({
      success: true,
      booking: {
        ...finalBooking,
        stripe_session: {
          id: stripeSession.id,
          status: stripeSession.status,
          payment_status: stripeSession.payment_status,
        }
      }
    });
  } catch (error) {
    console.error("Error in booking details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 