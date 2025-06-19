/**
 * Email utility functions
 */

/**
 * Get the sender email address from environment variables
 * Falls back to a default if not configured
 */
export function getSenderEmail(): string {
  const envEmail = process.env.EMAIL_FROM?.trim();
  
  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Don't use EMAIL_FROM if it's an unverified domain like gmail.com, yahoo.com, etc.
  // Also validate that it's a proper email format
  if (envEmail && 
      emailRegex.test(envEmail) &&
      !envEmail.includes('gmail.com') && 
      !envEmail.includes('yahoo.com') && 
      !envEmail.includes('hotmail.com') &&
      !envEmail.includes('outlook.com')) {
    console.log('Using EMAIL_FROM environment variable:', envEmail);
    return envEmail;
  }
  
  // Log what we're falling back to
  const fallbackEmail = 'noreply@servify-booking.shop';
  console.log('Falling back to default email:', fallbackEmail, 'envEmail was:', envEmail);
  
  // Fallback to default verified domain
  // If you're having domain verification issues, temporarily use:
  // return 'onboarding@resend.dev';
  return fallbackEmail;
}

/**
 * Get the formatted sender string with name and email
 */
export function getFormattedSender(name: string = 'Servify'): string {
  const email = getSenderEmail();
  
  // Validate the email one more time before formatting
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Invalid email detected:', email, 'using fallback');
    return 'Servify <noreply@servify-booking.shop>';
  }
  
  // Clean the name to avoid any special characters that might break the format
  const cleanName = name.replace(/[<>]/g, '').trim();
  const formatted = `${cleanName} <${email}>`;
  console.log('Formatted sender:', formatted);
  return formatted;
} 