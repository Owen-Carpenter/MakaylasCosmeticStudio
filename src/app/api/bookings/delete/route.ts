import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession(authOptions);
    
    // Parse the request body
    const { bookingId } = await req.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the user ID from the session
    const userId = session?.user?.id;
    
    // Get the booking details first
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (fetchError || !booking) {
      console.error("Error fetching booking:", fetchError);
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }
    
    // Check if user has access to delete this booking
    // Allow if user is the booking owner or an admin
    if (userId) {
      // Get user role to check if they're an admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      const isAdmin = userData?.role === 'admin';
      const isOwner = booking.user_id === userId;
      
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Only allow deleting bookings in pending status
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: "Only pending bookings can be deleted" },
        { status: 400 }
      );
    }
    
    // Delete the booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (deleteError) {
      console.error("Error deleting booking:", deleteError);
      return NextResponse.json(
        { success: false, message: "Failed to delete booking" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error in delete booking endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 