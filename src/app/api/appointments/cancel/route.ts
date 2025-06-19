import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentCancellationEmail } from '@/lib/email';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { appointmentId, userId } = await req.json();
    
    if (!appointmentId) {
      return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
    }

    // 1. Get booking details before cancellation
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }
    
    // 2. Update the booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);
    
    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      return NextResponse.json({ success: false, message: 'Failed to cancel appointment' }, { status: 500 });
    }
    
    // 3. Get user information for email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId || booking.user_id)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
    }
    
    // 4. Send cancellation email
    if (userData?.email) {
      try {
        await sendAppointmentCancellationEmail({
          email: userData.email,
          name: userData.name || 'Valued Customer',
          bookingId: appointmentId,
          serviceName: booking.service_name,
          date: new Date(booking.appointment_date).toLocaleDateString(),
          time: booking.appointment_time,
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Continue processing even if email fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Appointment cancelled successfully',
      appointment: {
        id: booking.id,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        date: booking.appointment_date,
        time: booking.appointment_time,
        status: 'cancelled'
      }
    });
    
  } catch (error) {
    console.error('Error in appointment cancellation API:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
} 