import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for accessing data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch only the minimal data needed for availability checking
    // No customer information or sensitive details - this is public data for booking availability
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, service_id, appointment_date, appointment_time, status')
      .in('status', ['confirmed', 'pending']) // Only active bookings that affect availability
      .order('appointment_date', { ascending: true });
    
    if (error) {
      console.error("Error fetching availability data:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch availability data" 
      }, { status: 500 });
    }

    // Transform the data to only include what's needed for availability checking
    // This is safe to expose as it contains no personal information
    const availabilityData = (bookings || []).map(booking => ({
      id: booking.id,
      service_id: booking.service_id,
      appointment_date: booking.appointment_date,
      appointment_time: booking.appointment_time,
      status: booking.status
    }));

    return NextResponse.json({ 
      success: true, 
      bookings: availabilityData 
    });
  } catch (error) {
    console.error("Error retrieving availability data:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch availability data" 
    }, { status: 500 });
  }
}

 