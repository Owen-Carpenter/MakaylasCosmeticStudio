import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isTimeOverlapping, parseTimeToMinutes, formatMinutesToTimeDisplay } from "@/lib/time-utils";
import { format, parseISO } from "date-fns";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// All possible time slots
const ALL_TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

// Mock service durations - would come from database in production
const SERVICE_DURATIONS: Record<string, number> = {
  "4a05b5fa-951f-4a05-a3f2-37b3c505eb45": 100, // Electrical Repairs
  "495fe372-ba26-4442-b583-6d7d187025a0": 120, // Financial Planning
  "default": 60, // Default duration if not found
};

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    
    // Validate parameters
    if (!date) {
      return NextResponse.json({
        success: false,
        message: "Date parameter is required"
      }, { status: 400 });
    }
    
    // Get service duration (default to 60 minutes if service ID not provided)
    const serviceDuration = serviceId ? (SERVICE_DURATIONS[serviceId] || SERVICE_DURATIONS.default) : SERVICE_DURATIONS.default;
    
    // Format date for querying
    let formattedDate;
    try {
      // Handle ISO date string or simple date string
      formattedDate = date.includes('T') 
        ? format(parseISO(date), "yyyy-MM-dd")
        : date;
    } catch {
      return NextResponse.json({
        success: false,
        message: "Invalid date format"
      }, { status: 400 });
    }
    
    // Fetch bookings for the selected date (confirmed and pending only)
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`status.eq.confirmed,status.eq.pending`)
      .eq('appointment_date', formattedDate);
    
    if (error) {
      console.error("Error fetching bookings for availability check:", error);
      return NextResponse.json({
        success: false,
        message: "Failed to check availability"
      }, { status: 500 });
    }
    
    // Create availability info for each time slot
    const availability = ALL_TIME_SLOTS.map(timeSlot => {
      // Find any conflicting booking
      const conflict = bookings?.find(booking => {
        const bookingServiceDuration = SERVICE_DURATIONS[booking.service_id] || SERVICE_DURATIONS.default;
        
        return isTimeOverlapping(
          timeSlot,
          serviceDuration,
          booking.appointment_time,
          bookingServiceDuration
        );
      });
      
      if (conflict) {
        const conflictDuration = SERVICE_DURATIONS[conflict.service_id] || SERVICE_DURATIONS.default;
        const conflictStart = parseTimeToMinutes(conflict.appointment_time);
        const conflictEnd = conflictStart + conflictDuration;
        
        return {
          time: timeSlot,
          available: false,
          reason: `Conflicts with ${conflict.service_name} from ${conflict.appointment_time} to ${formatMinutesToTimeDisplay(conflictEnd)}`
        };
      }
      
      return {
        time: timeSlot,
        available: true
      };
    });
    
    // List of just available times for convenience
    const availableTimes = availability
      .filter(slot => slot.available)
      .map(slot => slot.time);
    
    return NextResponse.json({
      success: true,
      date: formattedDate,
      availability,
      availableTimes
    });
    
  } catch (error) {
    console.error("Error in availability check:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check availability"
    }, { status: 500 });
  }
} 