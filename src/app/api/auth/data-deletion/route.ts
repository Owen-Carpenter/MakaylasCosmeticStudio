import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signed_request } = body;

    if (!signed_request) {
      return NextResponse.json(
        { error: "Missing signed_request parameter" },
        { status: 400 }
      );
    }

    // Parse the signed request from Facebook
    const [, payload] = signed_request.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    const userId = data.user_id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid signed request" },
        { status: 400 }
      );
    }

    // Find user by Facebook ID in user metadata
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching users:", authError);
      return NextResponse.json(
        { error: "Failed to process deletion request" },
        { status: 500 }
      );
    }

    const userToDelete = authUsers.users.find(user => 
      user.user_metadata?.facebook_id === userId || 
      user.user_metadata?.provider_id === userId
    );

    if (userToDelete) {
      // Delete user data from users table
      const { error: deleteUserError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (deleteUserError) {
        console.error("Error deleting user profile:", deleteUserError);
      }

      // Delete user bookings
      const { error: deleteBookingsError } = await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('user_id', userToDelete.id);

      if (deleteBookingsError) {
        console.error("Error deleting user bookings:", deleteBookingsError);
      }

      // Delete user from Supabase Auth
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
      
      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError);
      }

      console.log(`User data deleted for Facebook ID: ${userId}`);
    }

    // Return confirmation URL as required by Facebook
    const confirmationCode = `${userId}_${Date.now()}`;
    
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.servify-booking.shop'}/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    });

  } catch (error) {
    console.error("Error processing data deletion:", error);
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 }
    );
  }
}

// Handle GET requests to show deletion instructions
export async function GET() {
  return NextResponse.json({
    message: "User Data Deletion Instructions",
    instructions: [
      "To delete your account and all associated data:",
      "1. Go to your Facebook account settings",
      "2. Navigate to 'Apps and Websites'",
      "3. Find 'Makayla's Cosmetic Studio' and click 'Remove'",
      "4. Select 'Delete all your activities' when prompted",
      "5. Alternatively, contact us at makaylascosmeticstudio@gmail.com to request manual deletion"
    ],
    contact: "makaylascosmeticstudio@gmail.com"
  });
} 