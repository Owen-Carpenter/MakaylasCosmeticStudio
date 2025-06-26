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
    const fromName = session.user.name || 'Makayla\'s Cosmetic Studio';
    
    // Format the email content with HTML - Makayla's branding
    const adminEmail = session.user.email;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Makayla's Cosmetic Studio</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Beauty & Wellness Services</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Message from ${fromName}</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Dear ${customerName || 'Valued Customer'},</p>
          
          <div style="padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fef7ed 100%); border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          
          ${adminEmail ? `<p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>Reply to:</strong> <a href="mailto:${adminEmail}" style="color: #f59e0b; text-decoration: none;">${adminEmail}</a>
          </p>` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This email was sent from Makayla's Cosmetic Studio<br/>
              278 U.S. 65 Suite C, Conway, AR 72032 | (501) 575-7209
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Send the email using Resend with reply-to for better customer experience
    const emailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: `${subject} - Makayla's Cosmetic Studio`,
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