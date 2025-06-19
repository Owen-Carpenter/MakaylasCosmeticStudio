import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking ID is required" 
      }, { status: 400 });
    }
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Fetch the booking by ID from Supabase
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching booking by ID:", fetchError);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch booking" 
      }, { status: 500 });
    }
    
    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking not found" 
      }, { status: 404 });
    }
    
    // Check if user is allowed to cancel this booking
    // Only allow if user is the booking owner or an admin
    const isOwner = session.user.id === booking.user_id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "You are not authorized to cancel this booking" 
      }, { status: 403 });
    }
    
    // Update the booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to cancel booking" 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Booking cancelled successfully" 
    });
  } catch (error) {
    console.error("Error in cancelling booking:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 