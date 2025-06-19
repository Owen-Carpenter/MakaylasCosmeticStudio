import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET() {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }

    // Get user's auth data from Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { success: false, message: "User not found in auth system" },
        { status: 404 }
      );
    }

    // Extract linked accounts information
    const linkedAccounts = [];
    const userMetadata = authUser.user.user_metadata || {};

    // Check for email/password authentication
    if (authUser.user.email) {
      linkedAccounts.push({
        type: "email",
        identifier: authUser.user.email,
        provider: "credentials",
        verified: authUser.user.email_confirmed_at ? true : false
      });
    }

    // Check for OAuth providers
    const oauthProviders = ['google', 'facebook'];
    oauthProviders.forEach(provider => {
      const providerId = userMetadata[`${provider}_id`];
      if (providerId) {
        linkedAccounts.push({
          type: "oauth",
          identifier: providerId,
          provider: provider,
          verified: true // OAuth accounts are automatically verified
        });
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authUser.user.email,
        name: userMetadata.name || session.user.name,
        linkedAccounts,
        totalAccounts: linkedAccounts.length
      }
    });

  } catch (error) {
    console.error("Error fetching linked accounts:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 