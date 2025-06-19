import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Update all past confirmed bookings to completed status
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'confirmed')
      .lt('appointment_date', todayStr)
      .select('id, service_name, appointment_date');
    
    if (error) {
      console.error("Error updating past bookings to completed:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to update past bookings" 
      }, { status: 500 });
    }

    const updatedCount = data?.length || 0;
    console.log(`Successfully updated ${updatedCount} past bookings from confirmed to completed`);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} past bookings to completed`,
      updated: updatedCount,
      updatedBookings: data
    });
  } catch (error) {
    console.error("Error in update-past-completed endpoint:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 