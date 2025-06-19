/**
 * Parse a time string (like "9:00 AM") to total minutes since midnight
 * @param timeStr Time string in format "h:mm AM/PM"
 * @returns Total minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [hourMin, period] = timeStr.split(' ');
  const [hour, minute] = hourMin.split(':').map(Number);
  let hours = hour;
  
  // Convert to 24-hour format
  if (period === 'PM' && hour < 12) hours += 12;
  if (period === 'AM' && hour === 12) hours = 0;
  
  return hours * 60 + minute;
}

/**
 * Format minutes since midnight to a time string
 * @param minutes Total minutes since midnight
 * @returns Formatted time string (e.g., "9:00 AM")
 */
export function formatMinutesToTimeDisplay(minutes: number): string {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) hours -= 12;
  else if (hours === 0) hours = 12;
  
  return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Check if two time slots overlap
 * @param time1 First time slot start (e.g., "9:00 AM")
 * @param duration1 Duration of first time slot in minutes
 * @param time2 Second time slot start (e.g., "10:00 AM")
 * @param duration2 Duration of second time slot in minutes
 * @returns True if time slots overlap
 */
export function isTimeOverlapping(
  time1: string, 
  duration1: number, 
  time2: string, 
  duration2: number
): boolean {
  const time1Start = parseTimeToMinutes(time1);
  const time1End = time1Start + duration1;
  
  const time2Start = parseTimeToMinutes(time2);
  const time2End = time2Start + duration2;
  
  return (time1Start < time2End && time1End > time2Start);
}

/**
 * Extract a duration in minutes from a string like "60 min" or "1 hour"
 * @param durationStr Duration string 
 * @returns Duration in minutes
 */
export function parseDurationToMinutes(durationStr: string): number {
  const match = durationStr.match(/(\d+)\s*(min|hour|hr)/i);
  if (!match) return 60; // Default to 60 minutes if format is unknown
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  if (unit === 'hour' || unit === 'hr') {
    return value * 60;
  }
  
  return value; // Minutes
} 