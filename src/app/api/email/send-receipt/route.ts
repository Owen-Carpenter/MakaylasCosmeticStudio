import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      email,
      name,
      bookingId,
      serviceName,
      date,
      time,
      amount
    } = body;

    // Log the received data for debugging
    console.log('Email API received data:', {
      email: !!email ? email : 'MISSING',
      name: !!name ? name : 'MISSING',
      bookingId: !!bookingId ? bookingId : 'MISSING',
      serviceName: !!serviceName ? serviceName : 'MISSING',
      date: !!date ? date : 'MISSING',
      time: !!time ? time : 'MISSING',
      amount: !!amount ? amount : 'MISSING'
    });

    // Validate required fields with specific error messages
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!name) missingFields.push('name');
    if (!bookingId) missingFields.push('bookingId');
    if (!serviceName) missingFields.push('serviceName');
    if (!date) missingFields.push('date');
    if (!time) missingFields.push('time');
    if (!amount) missingFields.push('amount');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendPaymentReceiptEmail({
      email,
      name,
      bookingId,
      serviceName,
      date,
      time,
      amount
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in send-receipt API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 