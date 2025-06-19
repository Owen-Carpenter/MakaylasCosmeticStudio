import { NextResponse } from 'next/server';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    // Get payment details from request
    const {
      email,
      name,
      bookingId,
      serviceName,
      date,
      time,
      amount
    } = await req.json();
    
    // Validate required fields
    if (!email || !bookingId || !serviceName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: email, bookingId, and serviceName are required'
      }, { status: 400 });
    }
    
    // Send the email
    const result = await sendPaymentReceiptEmail({
      email,
      name: name || 'Valued Customer',
      bookingId,
      serviceName,
      date: date || new Date().toLocaleDateString(),
      time: time || '',
      amount: amount || '$0.00'
    });
    
    if (!result.success) {
      console.error('Failed to send payment receipt email:', result.error);
      return NextResponse.json({
        success: false,
        message: 'Failed to send email'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment receipt email sent successfully'
    });
    
  } catch (error) {
    console.error('Error in payment receipt email API:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
} 