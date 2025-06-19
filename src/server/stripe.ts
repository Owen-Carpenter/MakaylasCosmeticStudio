import Stripe from 'stripe';
import type { SupabaseBooking } from '../lib/supabase-bookings';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

/**
 * Checks if a booking's payment is complete based on Stripe session data
 * SERVER-SIDE ONLY - do not call from client
 */
export async function checkStripePaymentStatus(paymentIntent: string): Promise<{
  isComplete: boolean;
  stripeSession?: {
    id: string;
    status?: string;
    payment_status?: string;
  }
}> {
  try {
    // Get the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(paymentIntent);
    
    // Check if payment is complete in Stripe
    const isComplete = 
      stripeSession.payment_status === 'paid' || 
      stripeSession.status === 'complete';
    
    return {
      isComplete,
      stripeSession: {
        id: stripeSession.id,
        status: stripeSession.status || undefined,
        payment_status: stripeSession.payment_status || undefined
      }
    };
  } catch (error) {
    console.error(`Error checking Stripe payment status:`, error);
    return { isComplete: false };
  }
}

/**
 * Enhances bookings with Stripe session data
 * SERVER-SIDE ONLY - do not call from client
 */
export async function enhanceBookingsWithStripeData(
  bookings: SupabaseBooking[]
): Promise<SupabaseBooking[]> {
  // Make a copy to avoid mutating the original
  const enhancedBookings = [...bookings];
  
  // Enhance pending bookings with Stripe session data
  for (let i = 0; i < enhancedBookings.length; i++) {
    if (enhancedBookings[i].status === 'pending' && enhancedBookings[i].payment_intent) {
      try {
        const { isComplete, stripeSession } = await checkStripePaymentStatus(
          enhancedBookings[i].payment_intent
        );
        
        if (stripeSession) {
          // Add Stripe session data to the booking
          enhancedBookings[i].stripe_session = stripeSession;
          
          // If payment is complete, set payment_status to paid and status to confirmed
          if (isComplete) {
            if (enhancedBookings[i].payment_status === 'pending') {
              enhancedBookings[i].payment_status = 'paid';
            }
            if (enhancedBookings[i].status === 'pending') {
              enhancedBookings[i].status = 'confirmed';
            }
          }
        }
      } catch (error) {
        console.error(`Error enhancing booking ${enhancedBookings[i].id}:`, error);
      }
    }
  }
  
  return enhancedBookings;
} 