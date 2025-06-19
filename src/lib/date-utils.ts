import { format, parseISO, isValid } from 'date-fns';

/**
 * Standardized date utilities for the application
 * All dates should be stored in the database as YYYY-MM-DD format
 * All date comparisons should use these utilities
 */

/**
 * Convert any date input to YYYY-MM-DD format for database storage
 * @param date - Date object, ISO string, or YYYY-MM-DD string
 * @returns YYYY-MM-DD formatted string
 */
export function formatDateForDB(date: Date | string): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle ISO string or YYYY-MM-DD string
      if (date.includes('T')) {
        dateObj = parseISO(date);
      } else {
        // Assume it's already in YYYY-MM-DD format
        dateObj = new Date(date + 'T00:00:00');
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for DB:', error, 'Input:', date);
    // Fallback to current date
    return format(new Date(), 'yyyy-MM-dd');
  }
}

/**
 * Parse a date from database (YYYY-MM-DD) to Date object
 * @param dateString - YYYY-MM-DD formatted string from database
 * @returns Date object
 */
export function parseDateFromDB(dateString: string): Date {
  try {
    // Handle both YYYY-MM-DD and ISO string formats
    if (dateString.includes('T')) {
      return parseISO(dateString);
    } else {
      // For YYYY-MM-DD format, create date at midnight local time
      return new Date(dateString + 'T00:00:00');
    }
  } catch (error) {
    console.error('Error parsing date from DB:', error, 'Input:', dateString);
    // Fallback to current date
    return new Date();
  }
}

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns boolean
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  try {
    const d1 = typeof date1 === 'string' ? parseDateFromDB(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseDateFromDB(date2) : date2;
    
    return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
}

/**
 * Format date for display in the UI
 * @param date - Date object or string
 * @param formatString - Format string (default: 'EEEE, MMMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date | string, formatString: string = 'EEEE, MMMM d, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseDateFromDB(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Invalid Date';
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date as YYYY-MM-DD string
 */
export function getTodayForDB(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Validate if a date string is in correct YYYY-MM-DD format
 * @param dateString - Date string to validate
 * @returns boolean
 */
export function isValidDBDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    return isValid(date);
  } catch {
    return false;
  }
} 