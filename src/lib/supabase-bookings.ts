import { supabase } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils/url";

export interface SupabaseBooking {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  payment_intent: string;
  amount_paid: number;
  created_at: string;
  updated_at: string;
  stripe_session?: {
    id?: string;
    status?: string;
    payment_status?: string;
  };
  // Customer information
  customer_name?: string;
  customer_email?: string;
}

/**
 * Get all bookings for the current authenticated user
 * @param userId Optional user ID from NextAuth session
 * @returns An array of bookings
 */
export async function getUserBookings(userId?: string): Promise<SupabaseBooking[]> {
  try {
    let authenticatedUserId = userId;
    
    // If no userId provided, try to get from Supabase Auth as fallback
    if (!authenticatedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id;
    }
    
    if (!authenticatedUserId) {
      console.error("No authenticated user found");
      return [];
    }
    
    console.log("Fetching bookings for user ID:", authenticatedUserId);
    
    // Use direct SQL query to bypass RLS when userId is provided explicitly
    // This approach doesn't rely on the auth.uid() matching the user_id
    let bookings: SupabaseBooking[] = [];
    
    if (userId) {
      // When we have a userId from NextAuth, use a direct SQL query
      const { data, error } = await supabase
        .rpc('get_user_bookings', { user_id_param: authenticatedUserId });
      
      if (error) {
        console.error("Error fetching bookings with RPC:", error);
        
        // Fallback to direct query approach
        const { data: directData, error: directError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', authenticatedUserId)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error("Error fetching bookings with direct query:", directError);
          return [];
        }
        
        bookings = directData as SupabaseBooking[];
      } else {
        bookings = data as SupabaseBooking[];
      }
    } else {
      // Use normal RLS approach when relying on Supabase auth
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }
      
      bookings = data as SupabaseBooking[];
    }

    // For server-side enhancement, we'll use the API endpoint instead of direct Stripe access
    if (typeof window === 'undefined' && bookings.some(b => b.status === 'pending')) {
      try {
        // Make an API call to update any pending bookings
        await fetch(`${getBaseUrl()}/api/bookings/updatePendingStatus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: authenticatedUserId }),
        });
        
        // Re-fetch the bookings after the update
        return getUserBookings(userId);
      } catch (error) {
        console.error("Error updating pending bookings:", error);
        // Continue with current bookings if update fails
      }
    }
    
    return bookings;
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    return [];
  }
}

/**
 * Get a single booking by ID with customer information
 * @param id The booking ID
 * @returns The booking with customer details or null if not found
 */
export async function getBookingById(id: string): Promise<SupabaseBooking | null> {
  try {
    console.log("Attempting to fetch booking with ID:", id);
    
    // If we're on the client-side, use the API endpoint that has service role access
    if (typeof window !== 'undefined') {
      console.log("Fetching booking via API endpoint (client-side)");
      const response = await fetch(`/api/bookings/${id}`);
      
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        return null;
      }
      
      const result = await response.json();
      
      if (result.success && result.booking) {
        console.log("Successfully fetched booking from API:", result.booking);
        return result.booking as SupabaseBooking;
      } else {
        console.error("API error fetching booking:", result.message);
        return null;
      }
    }
    
    // Server-side: Try to use the database function if it exists
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_booking_with_customer', { booking_id: id });
      
      if (!functionError && functionResult && functionResult.length > 0) {
        console.log("Successfully fetched booking using database function:", functionResult[0]);
        return functionResult[0] as SupabaseBooking;
      }
      
      if (functionError && !functionError.message?.includes('does not exist')) {
        console.warn("Database function failed, falling back to manual approach:", functionError);
      }
    } catch {
      // Function doesn't exist yet, continue with fallback
      console.log("Database function not available yet, using fallback approach");
    }
    
    // Fallback: get the booking without joins to check if it exists
    const { data: basicBooking, error: basicError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 results gracefully
    
    if (basicError) {
      console.error("Error fetching basic booking by ID:", basicError);
      return null;
    }
    
    if (!basicBooking) {
      console.log("No booking found with ID:", id);
      return null;
    }
    
    console.log("Found basic booking:", basicBooking);
    
    // Now try to get customer information separately to avoid join issues
    let customerData: { name?: string; email?: string } = {};
    
    if (basicBooking.user_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', basicBooking.user_id)
        .maybeSingle();
      
      if (userError) {
        console.warn("Could not fetch user data for booking:", userError);
        // Continue without customer data rather than failing completely
      } else if (userData) {
        customerData = userData;
      }
    }
    
    // Combine booking with customer info
    const bookingWithCustomerInfo = {
      ...basicBooking,
      customer_name: customerData.name || null,
      customer_email: customerData.email || null,
    };
    
    console.log("Returning booking with customer info:", bookingWithCustomerInfo);
    return bookingWithCustomerInfo as SupabaseBooking;
  } catch (error) {
    console.error("Error in getBookingById:", error);
    return null;
  }
}

/**
 * Cancel a booking
 * @param id The booking ID
 * @returns Success status
 */
export async function cancelBooking(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return false;
  }
}

/**
 * Get the count of bookings by status for the current user
 * @param userId Optional user ID from NextAuth session
 * @returns The counts object
 */
export async function getBookingCountsByStatus(userId?: string): Promise<{ pending: number; confirmed: number; completed: number; cancelled: number; }> {
  try {
    let authenticatedUserId = userId;
    
    // If no userId provided, try to get from Supabase Auth as fallback
    if (!authenticatedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id;
    }
    
    if (!authenticatedUserId) {
      console.error("No authenticated user found");
      return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    }
    
    // Use direct SQL query to bypass RLS when userId is provided explicitly
    // This matches the approach in getUserBookings
    let bookings: Array<{ status: string }> = [];
    
    if (userId) {
      // Try RPC first
      const { data, error } = await supabase
        .rpc('get_user_bookings', { user_id_param: authenticatedUserId });
      
      if (error) {
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('bookings')
          .select('status')
          .eq('user_id', authenticatedUserId);
        
        if (directError) {
          console.error("Error fetching booking counts:", directError);
          return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
        }
        
        bookings = directData;
      } else {
        bookings = data as Array<{ status: string }>;
      }
    } else {
      // Use normal RLS approach
      const { data, error } = await supabase
        .from('bookings')
        .select('status')
        .eq('user_id', authenticatedUserId);
      
      if (error) {
        console.error("Error fetching booking counts:", error);
        return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      }
      
      bookings = data;
    }
    
    // Count occurrences of each status
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    bookings.forEach(booking => {
      if (booking.status in counts) {
        counts[booking.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error("Error in getBookingCountsByStatus:", error);
    return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  }
}

/**
 * Update a booking's date and time
 * @param id The booking ID
 * @param appointmentDate The new appointment date in YYYY-MM-DD format
 * @param appointmentTime The new appointment time
 * @returns Success status
 */
export async function updateBookingDateTime(
  id: string, 
  appointmentDate: string, 
  appointmentTime: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating booking date/time:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateBookingDateTime:", error);
    return false;
  }
}

/**
 * Get all bookings for admin view with customer information
 * @returns An array of bookings with customer details
 */
export async function getAllBookings(): Promise<SupabaseBooking[]> {
  try {
    // If we're on the client-side, use the API endpoint that has service role access
    if (typeof window !== 'undefined') {
      console.log("Fetching all bookings via API endpoint (client-side)");
      const response = await fetch('/api/bookings/all');
      
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        return [];
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Successfully fetched bookings from API:", result.bookings.length);
        return result.bookings as SupabaseBooking[];
      } else {
        console.error("API error fetching all bookings:", result.message);
        return [];
      }
    }
    
    // Server-side: Use service role key if available
    console.log("Fetching all bookings server-side");
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    let adminSupabase = supabase;
    if (serviceKey && serviceKey !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      adminSupabase = createClient(supabaseUrl, serviceKey);
    }
    
    // Use a joined query to get bookings with customer information
    const { data, error } = await adminSupabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching all bookings:", error);
      return [];
    }
    
    // Transform the data to include customer info in the main booking object
    const bookingsWithCustomerInfo = data.map(booking => {
      const customerData = booking.users || {};
      return {
        ...booking,
        customer_name: customerData.name || null,
        customer_email: customerData.email || null,
        users: undefined // Remove the nested users object
      };
    });
    
    return bookingsWithCustomerInfo as SupabaseBooking[];
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    return [];
  }
} 