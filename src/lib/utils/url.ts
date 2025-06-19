/**
 * Utility functions for URL generation using environment variables
 */

/**
 * Get the base URL for the application
 * Priority: NEXT_PUBLIC_APP_URL > NEXTAUTH_URL > fallback to production URL
 */
export function getBaseUrl(): string {
  // For client-side, use NEXT_PUBLIC_APP_URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  
  // For server-side, check multiple environment variables
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://www.servify-booking.shop' // Fallback
  );
}

/**
 * Get the base URL for API routes (server-side only)
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}

/**
 * Generate a full URL from a path
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate redirect URLs for authentication
 */
export function getAuthRedirectUrl(path: string = '/dashboard'): string {
  return getFullUrl(path);
}

/**
 * Generate booking success/cancel URLs
 */
export function getBookingSuccessUrl(sessionId?: string): string {
  const path = sessionId 
    ? `/booking/success?sessionId=${sessionId}`
    : '/booking/success?sessionId={CHECKOUT_SESSION_ID}';
  return getFullUrl(path);
}

export function getBookingCancelUrl(sessionId?: string): string {
  const path = sessionId 
    ? `/booking/cancel?sessionId=${sessionId}`
    : '/booking/cancel?sessionId={CHECKOUT_SESSION_ID}';
  return getFullUrl(path);
} 