import { createClient } from '@supabase/supabase-js';
import { sendAppointmentReminderEmail } from '@/lib/email';
import 'server-only';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AppointmentNotification {
  id: string;
  customer_email: string;
  customer_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}



/**
 * Get appointments that need 24-hour reminders
 * Returns appointments that are exactly 24 hours away and haven't been sent a 24-hour reminder
 */
export async function getAppointmentsFor24HourReminder(): Promise<AppointmentNotification[]> {
  try {
    // Calculate the target date (24 hours from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get start and end of tomorrow (to catch all appointments for that day)
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        appointment_time,
        created_at,
        reminder_24h_sent,
        users:user_id (
          name,
          email
        )
      `)
      .eq('status', 'confirmed')
      .gte('appointment_date', tomorrowStart.toISOString().split('T')[0])
      .lte('appointment_date', tomorrowEnd.toISOString().split('T')[0])
      .is('reminder_24h_sent', null); // Only get appointments that haven't received 24h reminder

    if (error) {
      console.error('Error fetching appointments for 24-hour reminder:', error);
      return [];
    }

    // Transform the data to match our interface
    const transformedData: AppointmentNotification[] = (data || []).map((appointment) => {
      // Handle the case where users might be returned as an array or object from the join
      const userArray = appointment.users as unknown;
      const user = Array.isArray(userArray) ? userArray[0] : userArray;
      return {
        id: appointment.id,
        customer_email: user?.email || '',
        customer_name: user?.name || 'Customer',
        service_name: appointment.service_name,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        created_at: appointment.created_at
      };
    });

    return transformedData;
  } catch (error) {
    console.error('Error in getAppointmentsFor24HourReminder:', error);
    return [];
  }
}

/**
 * Get appointments that need 1-hour reminders
 * Returns appointments that are starting in approximately 1 hour and haven't been sent a 1-hour reminder
 */
export async function getAppointmentsFor1HourReminder(): Promise<AppointmentNotification[]> {
  try {
    // Calculate the target time (1 hour from now)
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get the target time (with some flexibility - 1 hour ± 15 minutes)
    const targetMinutes = oneHourFromNow.getMinutes();
    
    // Create time range for matching (e.g., if it's 14:30, look for appointments between 14:15 and 14:45)
    const startTime = new Date(oneHourFromNow);
    startTime.setMinutes(targetMinutes - 15);
    
    const endTime = new Date(oneHourFromNow);
    endTime.setMinutes(targetMinutes + 15);
    
    const startTimeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        appointment_time,
        created_at,
        reminder_1h_sent,
        users:user_id (
          name,
          email
        )
      `)
      .eq('status', 'confirmed')
      .eq('appointment_date', today)
      .gte('appointment_time', startTimeStr)
      .lte('appointment_time', endTimeStr)
      .is('reminder_1h_sent', null); // Only get appointments that haven't received 1h reminder

    if (error) {
      console.error('Error fetching appointments for 1-hour reminder:', error);
      return [];
    }

    // Transform the data to match our interface
    const transformedData: AppointmentNotification[] = (data || []).map((appointment) => {
      // Handle the case where users might be returned as an array or object from the join
      const userArray = appointment.users as unknown;
      const user = Array.isArray(userArray) ? userArray[0] : userArray;
      return {
        id: appointment.id,
        customer_email: user?.email || '',
        customer_name: user?.name || 'Customer',
        service_name: appointment.service_name,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        created_at: appointment.created_at
      };
    });

    return transformedData;
  } catch (error) {
    console.error('Error in getAppointmentsFor1HourReminder:', error);
    return [];
  }
}

/**
 * Send 24-hour reminder emails for upcoming appointments
 */
export async function send24HourReminders(): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  try {
    const appointments = await getAppointmentsFor24HourReminder();
    console.log(`Found ${appointments.length} appointments for 24-hour reminders`);

    for (const appointment of appointments) {
      try {
        // Send the reminder email
        const result = await sendAppointmentReminderEmail({
          email: appointment.customer_email,
          name: appointment.customer_name,
          bookingId: appointment.id,
          serviceName: appointment.service_name,
          date: new Date(appointment.appointment_date).toLocaleDateString(),
          time: appointment.appointment_time,
          reminderType: '24-hour'
        });

        if (result.success) {
          // Mark as sent in database
          await supabase
            .from('bookings')
            .update({ 
              reminder_24h_sent: new Date().toISOString() 
            })
            .eq('id', appointment.id);

          sent++;
          console.log(`24-hour reminder sent successfully for booking ${appointment.id}`);
        } else {
          errors++;
          console.error(`Failed to send 24-hour reminder for booking ${appointment.id}:`, result.error);
        }
      } catch (error) {
        errors++;
        console.error(`Error processing 24-hour reminder for booking ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in send24HourReminders:', error);
    errors++;
  }

  return { sent, errors };
}

/**
 * Send 1-hour reminder emails for upcoming appointments
 */
export async function send1HourReminders(): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  try {
    const appointments = await getAppointmentsFor1HourReminder();
    console.log(`Found ${appointments.length} appointments for 1-hour reminders`);

    for (const appointment of appointments) {
      try {
        // Send the reminder email
        const result = await sendAppointmentReminderEmail({
          email: appointment.customer_email,
          name: appointment.customer_name,
          bookingId: appointment.id,
          serviceName: appointment.service_name,
          date: new Date(appointment.appointment_date).toLocaleDateString(),
          time: appointment.appointment_time,
          reminderType: '1-hour'
        });

        if (result.success) {
          // Mark as sent in database
          await supabase
            .from('bookings')
            .update({ 
              reminder_1h_sent: new Date().toISOString() 
            })
            .eq('id', appointment.id);

          sent++;
          console.log(`1-hour reminder sent successfully for booking ${appointment.id}`);
        } else {
          errors++;
          console.error(`Failed to send 1-hour reminder for booking ${appointment.id}:`, result.error);
        }
      } catch (error) {
        errors++;
        console.error(`Error processing 1-hour reminder for booking ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in send1HourReminders:', error);
    errors++;
  }

  return { sent, errors };
}

/**
 * Process all pending reminder notifications
 * This function should be called by a cron job or scheduled task
 */
export async function processReminderNotifications(): Promise<{
  total24h: number;
  total1h: number;
  sent24h: number;
  sent1h: number;
  errors24h: number;
  errors1h: number;
}> {
  console.log('Starting reminder notification processing...');

  // Send 24-hour reminders
  const result24h = await send24HourReminders();
  
  // Send 1-hour reminders
  const result1h = await send1HourReminders();

  const summary = {
    total24h: result24h.sent + result24h.errors,
    total1h: result1h.sent + result1h.errors,
    sent24h: result24h.sent,
    sent1h: result1h.sent,
    errors24h: result24h.errors,
    errors1h: result1h.errors
  };

  console.log('Reminder notification processing completed:', summary);
  return summary;
} 