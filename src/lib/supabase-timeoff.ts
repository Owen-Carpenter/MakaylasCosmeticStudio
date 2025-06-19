import { supabase } from "@/lib/auth";

export interface TimeOff {
  id: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
  start_time?: string; // HH:MM:SS format
  end_time?: string;   // HH:MM:SS format
  is_all_day: boolean;
  type: 'time_off' | 'holiday' | 'maintenance' | 'personal';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all time-off periods within a date range
 * @param fromDate Start date in YYYY-MM-DD format
 * @param toDate End date in YYYY-MM-DD format
 * @returns An array of time-off periods
 */
export async function getTimeOffPeriods(
  fromDate?: string,
  toDate?: string
): Promise<TimeOff[]> {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await fetch(`/api/timeoff?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching time off periods:", errorData.message);
      return [];
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Error in getTimeOffPeriods:", error);
    return [];
  }
}

/**
 * Create a new time-off period
 * @param timeOff The time-off data to create
 * @returns The created time-off period or null if failed
 */
export async function createTimeOff(
  timeOff: Omit<TimeOff, 'id' | 'created_at' | 'updated_at' | 'created_by'>
): Promise<TimeOff | null> {
  try {
    const response = await fetch('/api/timeoff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeOff),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating time off:", errorData.message);
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error in createTimeOff:", error);
    return null;
  }
}

/**
 * Update an existing time-off period
 * @param id The time-off ID to update
 * @param updates The fields to update
 * @returns The updated time-off period or null if failed
 */
export async function updateTimeOff(
  id: string,
  updates: Partial<Omit<TimeOff, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
): Promise<TimeOff | null> {
  try {
    const response = await fetch('/api/timeoff', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating time off:", errorData.message);
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error in updateTimeOff:", error);
    return null;
  }
}

/**
 * Delete a time-off period
 * @param id The ID of the time-off period to delete
 * @returns Success boolean
 */
export async function deleteTimeOff(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/timeoff?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting time off:", errorData.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteTimeOff:", error);
    return false;
  }
}

/**
 * Check if a booking time conflicts with any time-off periods
 * @param bookingDate The booking date in YYYY-MM-DD format
 * @param startTime The booking start time in HH:MM format
 * @param durationMinutes The booking duration in minutes
 * @returns True if there's a conflict, false otherwise
 */
export async function checkTimeOffConflict(
  bookingDate: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  try {
    // Convert start time to minutes and calculate end time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + durationMinutes;
    
    // Convert back to HH:MM:SS format for database
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    const bookingStartTime = formatTime(startMinutes);
    const bookingEndTime = formatTime(endMinutes);

    // Use the database function to check for conflicts
    const { data, error } = await supabase
      .rpc('check_booking_time_off_conflict', {
        booking_date: bookingDate,
        booking_start_time: bookingStartTime,
        booking_end_time: bookingEndTime
      });

    if (error) {
      console.error("Error checking time off conflict:", error);
      // Fallback to manual check
      return await manualTimeOffConflictCheck(bookingDate, startTime, durationMinutes);
    }

    return data as boolean;
  } catch (error) {
    console.error("Error in checkTimeOffConflict:", error);
    // Fallback to manual check
    return await manualTimeOffConflictCheck(bookingDate, startTime, durationMinutes);
  }
}

/**
 * Manual fallback function to check time-off conflicts
 */
async function manualTimeOffConflictCheck(
  bookingDate: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  try {
    const timeOffPeriods = await getTimeOffPeriods(bookingDate, bookingDate);
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const bookingStartMinutes = startHour * 60 + startMinute;
    const bookingEndMinutes = bookingStartMinutes + durationMinutes;

    for (const timeOff of timeOffPeriods) {
      // Check if the booking date falls within the time-off period
      if (bookingDate >= timeOff.start_date && bookingDate <= timeOff.end_date) {
        // If it's an all-day time off, there's definitely a conflict
        if (timeOff.is_all_day) {
          return true;
        }

        // Check time overlap if specific times are set
        if (timeOff.start_time && timeOff.end_time) {
          const [timeOffStartHour, timeOffStartMin] = timeOff.start_time.split(':').map(Number);
          const [timeOffEndHour, timeOffEndMin] = timeOff.end_time.split(':').map(Number);
          
          const timeOffStartMinutes = timeOffStartHour * 60 + timeOffStartMin;
          const timeOffEndMinutes = timeOffEndHour * 60 + timeOffEndMin;

          // Check if booking time overlaps with time-off time
          if (!(bookingEndMinutes <= timeOffStartMinutes || bookingStartMinutes >= timeOffEndMinutes)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error in manual time off conflict check:", error);
    return false;
  }
}

/**
 * Get time-off periods that affect a specific date
 * @param date The date to check in YYYY-MM-DD format
 * @returns Array of time-off periods affecting that date
 */
export async function getTimeOffForDate(date: string): Promise<TimeOff[]> {
  try {
    const { data, error } = await supabase
      .from('time_off')
      .select('*')
      .lte('start_date', date)
      .gte('end_date', date)
      .order('start_time', { ascending: true });

    if (error) {
      console.error("Error fetching time off for date:", error);
      return [];
    }

    return data as TimeOff[];
  } catch (error) {
    console.error("Error in getTimeOffForDate:", error);
    return [];
  }
} 