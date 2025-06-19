import { toast } from "@/components/ui/use-toast";
import { getUserBookings, SupabaseBooking } from "./supabase-bookings";
import { parseDateFromDB, formatDateForDB } from "./date-utils";

// Appointment statuses
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Appointment interface
export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  price: number;
  status: AppointmentStatus;
  providerName: string;
  location: string;
  duration: string;
  bookingDate: Date;
  category: string;
}

// Convert Supabase booking to our Appointment interface
function mapSupabaseBookingToAppointment(booking: SupabaseBooking): Appointment {
  // Use standardized date parsing
  const appointmentDate = parseDateFromDB(booking.appointment_date);
  const bookingDate = new Date(booking.created_at);

  // Check if payment is complete in Stripe even if booking status is still pending
  const stripePaymentComplete = 
    booking.stripe_session?.payment_status === 'paid' || 
    booking.stripe_session?.status === 'complete' ||
    booking.payment_status === 'paid'; // Also check booking.payment_status
  
  // If Stripe shows payment is complete, treat the booking as confirmed
  let effectiveStatus: AppointmentStatus = 
    booking.status === 'pending' && stripePaymentComplete
      ? 'confirmed'
      : booking.status as AppointmentStatus;

  // Check if confirmed appointment is in the past - if so, mark as completed
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  
  if (effectiveStatus === 'confirmed' && appointmentDateOnly < today) {
    effectiveStatus = 'completed';
  }

  return {
    id: booking.id,
    serviceId: booking.service_id,
    serviceName: booking.service_name,
    date: appointmentDate,
    time: booking.appointment_time,
    price: booking.amount_paid,
    status: effectiveStatus,
    providerName: "Service Provider", // This information would be joined from a providers table in a real app
    location: "Service Location", // This information would be joined from a locations table in a real app
    duration: "60 min", // This information would be joined from a services table in a real app
    bookingDate: bookingDate,
    category: "service" // This information would be joined from a services table in a real app
  };
}

/**
 * Get appointments for the current user from Supabase
 * @param userId Optional user ID to pass to Supabase
 */
export async function getAppointments(userId?: string): Promise<Appointment[]> {
  try {
    console.log("getAppointments: Fetching with userId:", userId);
    
    // Fetch bookings from Supabase
    const supabaseBookings = await getUserBookings(userId);
    console.log("getAppointments: Raw Supabase bookings:", supabaseBookings);
    
    if (!supabaseBookings || supabaseBookings.length === 0) {
      console.log("getAppointments: No bookings found");
      return [];
    }
    
    // Convert to our Appointment interface
    const appointments = supabaseBookings.map(booking => {
      const appointment = mapSupabaseBookingToAppointment(booking);
      console.log("getAppointments: Mapped appointment:", appointment);
      return appointment;
    });
    
    console.log("getAppointments: Final appointments list:", appointments);
    return appointments;
  } catch (error) {
    console.error("Error in getAppointments:", error);
    return [];
  }
}

/**
 * Cancel an appointment by ID
 * @param appointmentId The ID of the appointment to cancel
 * @param userId Optional user ID to pass to Supabase
 * @returns The updated appointment or null if not found
 */
export async function cancelAppointment(appointmentId: string, userId?: string): Promise<Appointment | null> {
  try {
    // Use the server API to cancel the appointment
    const response = await fetch('/api/appointments/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        userId
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: data.message || "There was a problem cancelling your appointment.",
      });
      return null;
    }
    
    // Refresh the appointments list to get the updated data
    const appointments = await getAppointments(userId);
    const updatedAppointment = appointments.find(a => a.id === appointmentId);
    
    toast({
      variant: "success",
      title: "Appointment Cancelled",
      description: "Your appointment has been successfully cancelled",
    });
    
    return updatedAppointment || null;
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to cancel appointment. Please try again.",
    });
    
    return null;
  }
}

/**
 * Reschedule an appointment by ID
 * @param appointmentId The ID of the appointment to reschedule
 * @param newDate The new date for the appointment
 * @param newTime The new time for the appointment
 * @param userId Optional user ID to pass to Supabase
 * @returns The updated appointment or null if not found
 */
export async function updateAppointmentDateTime(
  appointmentId: string, 
  newDate: Date, 
  newTime: string, 
  userId?: string
): Promise<Appointment | null> {
  try {
    // Use the server API to reschedule the appointment
    const response = await fetch('/api/appointments/reschedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        appointmentDate: formatDateForDB(newDate), // Use standardized date formatting
        appointmentTime: newTime,
        userId
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: data.message || "There was a problem rescheduling your appointment.",
      });
      return null;
    }
    
    // Refresh the appointments list to get the updated data
    const appointments = await getAppointments(userId);
    const updatedAppointment = appointments.find(a => a.id === appointmentId);
    
    toast({
      variant: "success",
      title: "Appointment Rescheduled",
      description: "Your appointment has been successfully rescheduled",
    });
    
    return updatedAppointment || null;
  } catch (error) {
    console.error("Error in updateAppointmentDateTime:", error);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to reschedule appointment. Please try again.",
    });
    
    return null;
  }
}

/**
 * Get a single appointment by ID
 * @param appointmentId The ID of the appointment to fetch
 * @returns The appointment or null if not found
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  try {
    // Fetch the booking from Supabase using our API
    const response = await fetch(`/api/bookings/${appointmentId}`);
    
    if (!response.ok) {
      console.error("Error fetching appointment:", response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.booking) {
      console.error("No booking data returned:", data.message);
      return null;
    }
    
    // Map the booking to our Appointment interface
    const appointment = mapSupabaseBookingToAppointment(data.booking);
    return appointment;
  } catch (error) {
    console.error("Error in getAppointmentById:", error);
    return null;
  }
} 