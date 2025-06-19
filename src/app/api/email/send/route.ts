import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Resend } from 'resend';
import { getSenderEmail } from '@/lib/utils/email';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Get the current session to check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: You must be logged in to send emails."
      }, { status: 401 });
    }
    
    // Check if the user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: "Forbidden: Only admins can send emails."
      }, { status: 403 });
    }
    
    // Parse the request body
    const { to, subject, message, customerName } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: to, subject, or message"
      }, { status: 400 });
    }
    
    // Get the sender email from environment variables with proper validation
    const fromEmail = getSenderEmail();
    
    // Use the sender's name from the session
    const fromName = session.user.name || 'Service Admin';
    
    // Format the email content with HTML - include admin's actual email in the content
    const adminEmail = session.user.email;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Message from ${fromName}</h2>
        <p>Dear ${customerName || 'Customer'},</p>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin: 20px 0;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        ${adminEmail ? `<p style="color: #666; font-size: 14px; margin-top: 20px;">
          <strong>Reply to:</strong> <a href="mailto:${adminEmail}" style="color: #007bff;">${adminEmail}</a>
        </p>` : ''}
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This email was sent from the service management platform.
        </p>
      </div>
    `;
    
    // Send the email using Resend with reply-to for better customer experience
    const emailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
      ...(adminEmail && { replyTo: adminEmail }),
    };
    
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({
        success: false,
        message: "Failed to send email",
        error: error.message
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data
    });
    
  } catch (error) {
    console.error('Error in email send API:', error);
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 