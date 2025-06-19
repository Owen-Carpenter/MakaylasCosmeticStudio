import { NextResponse } from "next/server";
import { Resend } from 'resend';
import { getSenderEmail } from '@/lib/utils/email';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { name, email, subject, message } = await request.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: "All fields are required"
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Please provide a valid email address"
      }, { status: 400 });
    }
    
    // Get the contact email from environment variables
    const contactEmail = process.env.CONTACT_EMAIL || 'owen.carpenter.work@gmail.com';
    // Get the sender email from environment variables with proper validation
    const fromEmail = getSenderEmail();
    
    // Format the email content with HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From Servify Website</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Message</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #764ba2; line-height: 1.6;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee;">
            <a href="mailto:${email}?subject=Re: ${subject}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 12px 25px; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      display: inline-block;">
              Reply to ${name}
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            This email was sent from the Servify contact form at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;
    
    // Send the email using Resend
    const { error } = await resend.emails.send({
      from: `${name} via Servify <${fromEmail}>`,
      to: [contactEmail],
      subject: `Contact Form: ${subject}`,
      html: htmlContent,
      replyTo: email, // Allow direct replies to the person who submitted the form
    });
    
    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({
        success: false,
        message: "Failed to send email. Please try again later."
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon."
    });
    
  } catch (error) {
    console.error('Error in contact form API:', error);
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
} 