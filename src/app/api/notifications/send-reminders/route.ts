import { NextResponse } from 'next/server';
import { processReminderNotifications } from '@/lib/notifications/scheduler';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if we have a cron secret configured
    if (cronSecret) {
      // Verify the cron secret if configured
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized: Invalid or missing cron secret'
        }, { status: 401 });
      }
    }

    // Process reminder notifications
    const result = await processReminderNotifications();

    return NextResponse.json({
      success: true,
      message: 'Reminder notifications processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in send-reminders API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while processing reminders',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Allow GET requests for testing purposes (remove in production)
export async function GET() {
  try {
    const result = await processReminderNotifications();

    return NextResponse.json({
      success: true,
      message: 'Reminder notifications processed successfully (TEST MODE)',
      data: result
    });

  } catch (error) {
    console.error('Error in send-reminders API (GET):', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while processing reminders',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 