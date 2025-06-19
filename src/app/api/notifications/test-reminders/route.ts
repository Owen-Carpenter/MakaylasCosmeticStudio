import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { 
  getAppointmentsFor24HourReminder, 
  getAppointmentsFor1HourReminder,
  send24HourReminders,
  send1HourReminders 
} from '@/lib/notifications/scheduler';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: You must be logged in'
      }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Forbidden: Only admins can access this endpoint'
      }, { status: 403 });
    }

    // Get appointments that would receive reminders (without sending)
    const appointments24h = await getAppointmentsFor24HourReminder();
    const appointments1h = await getAppointmentsFor1HourReminder();

    return NextResponse.json({
      success: true,
      message: 'Reminder notifications preview',
      data: {
        appointments24h: {
          count: appointments24h.length,
          appointments: appointments24h.map(apt => ({
            id: apt.id,
            customer_name: apt.customer_name,
            customer_email: apt.customer_email,
            service_name: apt.service_name,
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time
          }))
        },
        appointments1h: {
          count: appointments1h.length,
          appointments: appointments1h.map(apt => ({
            id: apt.id,
            customer_name: apt.customer_name,
            customer_email: apt.customer_email,
            service_name: apt.service_name,
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error in test-reminders API (GET):', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching reminder data',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: You must be logged in'
      }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Forbidden: Only admins can send test reminders'
      }, { status: 403 });
    }

    const body = await request.json();
    const { type } = body;

    let result;
    
    if (type === '24-hour') {
      result = await send24HourReminders();
    } else if (type === '1-hour') {
      result = await send1HourReminders();
    } else if (type === 'both' || !type) {
      const result24h = await send24HourReminders();
      const result1h = await send1HourReminders();
      
      result = {
        sent: result24h.sent + result1h.sent,
        errors: result24h.errors + result1h.errors,
        breakdown: {
          '24-hour': result24h,
          '1-hour': result1h
        }
      };
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid type. Use "24-hour", "1-hour", or "both"'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test reminders sent successfully (${type || 'both'})`,
      data: result
    });

  } catch (error) {
    console.error('Error in test-reminders API (POST):', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while sending test reminders',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 