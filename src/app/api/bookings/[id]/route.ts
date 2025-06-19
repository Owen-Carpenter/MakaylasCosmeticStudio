import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
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
    
    // Fetch the booking by ID from Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching booking by ID:", error);
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
    
    return NextResponse.json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    console.error("Error retrieving booking by ID:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch booking" 
    }, { status: 500 });
  }
} 