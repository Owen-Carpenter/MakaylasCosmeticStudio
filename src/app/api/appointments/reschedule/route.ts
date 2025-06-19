import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkTimeOffConflict } from '@/lib/supabase-timeoff';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { appointmentId, appointmentDate, appointmentTime, userId } = body;
    
    // Validate required fields
    if (!appointmentId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields' 
        },
        { status: 400 }
      );
    }
    
    // Get the booking to check if the user is authorized to update it
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointment not found' 
        },
        { status: 404 }
      );
    }
    
    // Check if user is an admin
    let isAdmin = false;
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!userError && userData) {
        isAdmin = userData.role === 'admin';
      }
    }
    
    // Verify the user owns this appointment or is an admin
    if (userId && booking.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authorized to reschedule this appointment' 
        },
        { status: 403 }
      );
    }
    
    // Check if the booking can be rescheduled (not cancelled/completed)
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot reschedule an appointment that is ${booking.status}` 
        },
        { status: 400 }
      );
    }
    
    // Get service details to determine duration for time off conflict check
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', booking.service_id)
      .single();
    
    let durationMinutes = 60; // Default duration
    if (!serviceError && serviceData?.duration) {
      // Parse duration string like "60 min" to get minutes
      const durationMatch = serviceData.duration.match(/(\d+)/);
      if (durationMatch) {
        durationMinutes = parseInt(durationMatch[1], 10);
      }
    }
    
    // Convert appointmentTime from "9:00 AM" format to "09:00" format for time off check
    const convertTo24Hour = (time12h: string): string => {
      const [timeStr, period] = time12h.split(' ');
      const [hours, minutes] = timeStr.split(':');
      let hour24 = parseInt(hours, 10);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    };
    
    const time24h = convertTo24Hour(appointmentTime);
    
    // Check for time off conflicts
    const hasTimeOffConflict = await checkTimeOffConflict(
      appointmentDate,
      time24h,
      durationMinutes
    );
    
    if (hasTimeOffConflict) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'The selected time conflicts with a blocked period. Please choose a different time.' 
        },
        { status: 409 }
      );
    }
    
    // Update the booking in Supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (updateError) {
      console.error('Error updating booking date/time:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update appointment' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: booking.id,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        date: appointmentDate,
        time: appointmentTime,
        status: booking.status
      }
    });
  } catch (error) {
    console.error("Error in reschedule API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while rescheduling' 
      },
      { status: 500 }
    );
  }
} 