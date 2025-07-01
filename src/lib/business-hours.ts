// Business Hours Configuration for Makayla's Cosmetic Studio
export interface BusinessHours {
  [key: number]: {
    isOpen: boolean;
    openTime: string; // 24-hour format (e.g., "06:00")
    closeTime: string; // 24-hour format (e.g., "20:00")
  };
}

// Business hours: 0 = Sunday, 1 = Monday, etc.
export const BUSINESS_HOURS: BusinessHours = {
  0: { isOpen: false, openTime: "00:00", closeTime: "00:00" }, // Sunday - Closed
  1: { isOpen: true, openTime: "06:00", closeTime: "20:00" },  // Monday - 6 AM to 8 PM
  2: { isOpen: true, openTime: "06:00", closeTime: "20:00" },  // Tuesday - 6 AM to 8 PM
  3: { isOpen: true, openTime: "06:00", closeTime: "20:00" },  // Wednesday - 6 AM to 8 PM
  4: { isOpen: true, openTime: "06:00", closeTime: "20:00" },  // Thursday - 6 AM to 8 PM
  5: { isOpen: true, openTime: "06:00", closeTime: "15:00" },  // Friday - 6 AM to 3 PM
  6: { isOpen: true, openTime: "06:00", closeTime: "13:00" },  // Saturday - 6 AM to 1 PM
};

// Convert 24-hour time to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to 12-hour format
export function minutesToTime12Hour(minutes: number): string {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) hours -= 12;
  else if (hours === 0) hours = 12;
  
  return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Generate time slots for a specific date
export function generateTimeSlotsForDate(date: Date, slotDurationMinutes: number = 60): string[] {
  const dayOfWeek = date.getDay();
  const businessHour = BUSINESS_HOURS[dayOfWeek];
  
  // If closed, return empty array
  if (!businessHour.isOpen) {
    return [];
  }
  
  const openMinutes = timeToMinutes(businessHour.openTime);
  const closeMinutes = timeToMinutes(businessHour.closeTime);
  
  const timeSlots: string[] = [];
  
  // Generate slots from open to close, ensuring service can be completed before closing
  for (let currentMinutes = openMinutes; currentMinutes + slotDurationMinutes <= closeMinutes; currentMinutes += slotDurationMinutes) {
    timeSlots.push(minutesToTime12Hour(currentMinutes));
  }
  
  return timeSlots;
}

// Check if a specific time is within business hours for a date
export function isTimeWithinBusinessHours(date: Date, timeString: string): boolean {
  const dayOfWeek = date.getDay();
  const businessHour = BUSINESS_HOURS[dayOfWeek];
  
  if (!businessHour.isOpen) {
    return false;
  }
  
  // Convert time string to minutes
  const [hourMin, period] = timeString.split(' ');
  const [hour, minute] = hourMin.split(':').map(Number);
  let hours = hour;
  if (period === 'PM' && hour < 12) hours += 12;
  if (period === 'AM' && hour === 12) hours = 0;
  const timeMinutes = hours * 60 + minute;
  
  const openMinutes = timeToMinutes(businessHour.openTime);
  const closeMinutes = timeToMinutes(businessHour.closeTime);
  
  return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
}

// Check if business is open on a specific date
export function isBusinessOpenOnDate(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return BUSINESS_HOURS[dayOfWeek].isOpen;
}

// Get business hours for a specific date
export function getBusinessHoursForDate(date: Date): { isOpen: boolean; openTime?: string; closeTime?: string } {
  const dayOfWeek = date.getDay();
  const businessHour = BUSINESS_HOURS[dayOfWeek];
  
  if (!businessHour.isOpen) {
    return { isOpen: false };
  }
  
  return {
    isOpen: true,
    openTime: minutesToTime12Hour(timeToMinutes(businessHour.openTime)),
    closeTime: minutesToTime12Hour(timeToMinutes(businessHour.closeTime))
  };
}

// Get day names for display
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

// Validate if an appointment can fit within business hours
export function validateAppointmentTime(date: Date, timeString: string, durationMinutes: number): {
  isValid: boolean;
  reason?: string;
} {
  const dayOfWeek = date.getDay();
  const businessHour = BUSINESS_HOURS[dayOfWeek];
  
  if (!businessHour.isOpen) {
    return {
      isValid: false,
      reason: `We are closed on ${getDayName(dayOfWeek)}s`
    };
  }
  
  // Convert appointment time to minutes
  const [hourMin, period] = timeString.split(' ');
  const [hour, minute] = hourMin.split(':').map(Number);
  let hours = hour;
  if (period === 'PM' && hour < 12) hours += 12;
  if (period === 'AM' && hour === 12) hours = 0;
  const appointmentStartMinutes = hours * 60 + minute;
  const appointmentEndMinutes = appointmentStartMinutes + durationMinutes;
  
  const openMinutes = timeToMinutes(businessHour.openTime);
  const closeMinutes = timeToMinutes(businessHour.closeTime);
  
  if (appointmentStartMinutes < openMinutes) {
    return {
      isValid: false,
      reason: `Appointment starts before business hours (opens at ${minutesToTime12Hour(openMinutes)})`
    };
  }
  
  if (appointmentEndMinutes > closeMinutes) {
    return {
      isValid: false,
      reason: `Appointment would end after business hours (closes at ${minutesToTime12Hour(closeMinutes)})`
    };
  }
  
  return { isValid: true };
} 