import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found"
      });
    }
    
    // Return the session data for debugging
    return NextResponse.json({
      success: true,
      session: {
        user: session.user,
        expires: session.expires,
        // Include any other session properties safely
        sessionKeys: Object.keys(session),
        userKeys: Object.keys(session.user || {}),
      }
    });
    
  } catch (error) {
    console.error('Error in debug session API:', error);
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 