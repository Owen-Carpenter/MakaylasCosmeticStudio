import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { formatDateForDB } from "@/lib/date-utils";
import { getBookingSuccessUrl, getBookingCancelUrl } from "@/lib/utils/url";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Get the current session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    // Debug logging
    console.log("Session state:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });
    
    // Parse booking data from request
    const bookingData = await req.json();
    
    // For demo purposes: Log the booking data
    console.log("Booking Request:", bookingData);
    
    // Get user ID from the booking data (passed from frontend) or session
    const userId = bookingData.userId || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID is required" 
      }, { status: 400 });
    }
    
    // Create a unique booking ID
    const bookingId = `booking-${Date.now()}`;
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-03-31.basil",
    });
    
    // Use environment variable for consistent URL generation
    
    // Create a Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: bookingData.serviceName || "Service Booking",
              description: `${bookingData.date ? new Date(bookingData.date).toLocaleDateString() : ""} at ${bookingData.time || ""}`,
            },
            unit_amount: Math.round((bookingData.price || 99) * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        userId,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        variantId: bookingData.variantId || "",
        variantName: bookingData.variantName || "",
        date: bookingData.date ? new Date(bookingData.date).toISOString() : "",
        time: bookingData.time || "",
      },
      mode: "payment",
      success_url: getBookingSuccessUrl(),
      cancel_url: getBookingCancelUrl(),
    });
    
    // First check if user exists in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    console.log("User check result:", { userData, userError });
      
    // If user doesn't exist in our custom users table, we need to add them
    if (userError && !userData) {
      console.log("Attempting to create user...");
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: session?.user?.email || '',
          name: session?.user?.name || session?.user?.email?.split('@')[0] || '',
          role: 'customer'
        });
        
      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return NextResponse.json({
          success: false,
          message: "Failed to create user account"
        }, { status: 500 });
      }
      console.log("User created successfully");
    }
    
    // Save a temporary booking record to Supabase with pending status
    // The actual booking will be confirmed via the Stripe webhook once payment is completed
    console.log("Creating temporary pending booking...");
    const { error } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        user_id: userId,
        service_id: bookingData.serviceId,
        service_name: bookingData.serviceName,
        variant_id: bookingData.variantId || null, // Optional variant ID
        variant_name: bookingData.variantName || null, // Optional variant name
        appointment_date: formatDateForDB(bookingData.date),
        appointment_time: bookingData.time,
        status: 'pending', // Always pending until webhook confirms payment
        payment_status: 'unpaid', // Always unpaid until webhook confirms payment
        payment_intent: stripeSession.id,
        amount_paid: 0, // Amount will be updated after successful payment
        created_at: new Date().toISOString(),
      });
      
    if (error) {
      console.error("Error saving booking to database:", error);
      // If we get a foreign key violation, it's likely because the user doesn't exist in users table
      if (error.code === '23503') {  // Foreign key violation
        return NextResponse.json({
          success: false,
          message: "User account issue. Please contact support."
        }, { status: 400 });
      }
      return NextResponse.json({
        success: false,
        message: "Failed to save booking to database"
      }, { status: 500 });
    }
    
    console.log("Temporary pending booking saved successfully with ID:", bookingId);
    
    // Return the Stripe session URL for redirection
    return NextResponse.json({ 
      success: true, 
      bookingId,
      userId,
      message: "Booking initiated. Redirecting to payment...",
      redirectUrl: stripeSession.url
    });
    
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating booking:", error);
    
    // Return an error response
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create booking. Please try again." 
      }, 
      { status: 500 }
    );
  }
} 