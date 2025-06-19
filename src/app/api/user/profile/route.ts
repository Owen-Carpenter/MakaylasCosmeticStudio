import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase, updateUserProfile } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// This endpoint is for getting the user's profile
export async function GET() {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("Unauthorized: No session or user found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("Fetching profile for user:", session.user.id);
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Check if we have a valid user ID
    if (!userId) {
      console.error("Missing user ID in session");
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }
    
    // Fetch the user's profile from the database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, role, created_at, updated_at")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      
      // If user doesn't exist (PGRST116), try to create a profile from session data
      if (error.code === 'PGRST116') {
        console.log("User profile not found in database, attempting to create from session data");
        
        try {
          // Create user profile from session data
          const newProfile = {
            id: userId,
            name: session.user.name || session.user.email?.split('@')[0] || null,
            email: session.user.email,
            phone: null,
            role: "customer", // Default role
          };
          
          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .insert(newProfile)
            .select("id, name, email, phone, role, created_at, updated_at")
            .single();
            
          if (createError) {
            console.error("Error creating user profile from session:", createError);
            return NextResponse.json(
              { success: false, message: "User profile not found and could not be created." },
              { status: 404 }
            );
          }
          
          console.log("User profile created successfully from session data");
          
          // Return the newly created user data
          return NextResponse.json({
            success: true,
            user: {
              id: createdUser.id,
              name: createdUser.name,
              email: createdUser.email,
              phone: createdUser.phone,
              role: createdUser.role,
              createdAt: createdUser.created_at,
              updatedAt: createdUser.updated_at
            }
          });
          
        } catch (createError) {
          console.error("Failed to create user profile from session:", createError);
          return NextResponse.json(
            { success: false, message: "User profile not found and could not be created." },
            { status: 404 }
          );
        }
      }
      
      // For other errors, return 500
      return NextResponse.json(
        { success: false, message: "Failed to fetch profile", error: error },
        { status: 500 }
      );
    }
    
    if (!user) {
      console.error("User not found in database");
      return NextResponse.json(
        { success: false, message: "User profile not found. Please complete your profile setup." },
        { status: 404 }
      );
    }
    
    console.log("User profile fetched successfully:", user);
    
    // Return the user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error("Error in profile GET handler:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}

// This endpoint is for updating the user's profile
export async function PUT(req: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("Unauthorized: No session or user found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("Processing profile update for user:", session.user.id);
    
    // Parse the request body
    const data = await req.json();
    console.log("Profile update data:", data);
    
    // Use the user ID from the session or from the request data
    const userId = session.user.id || data.id;
    
    // Check if we have a valid user ID
    if (!userId) {
      console.error("Missing user ID in both session and request data");
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }
    
    console.log("Using user ID for update:", userId);
    
    // First, get the current user data to ensure we don't lose any fields
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("name, email, phone")
      .eq("id", userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching current user data:", fetchError);
    } else {
      console.log("Current user data:", currentUser);
    }
    
    // Prepare update data, preserving existing values if not provided
    const updateData = {
      name: data.name ?? currentUser?.name ?? null,
      phone: data.phone ?? currentUser?.phone ?? null,
    };
    
    console.log("Final update data:", updateData);
    
    // Update profile using the updateUserProfile function
    const updateSuccess = await updateUserProfile({
      id: userId,
      name: updateData.name,
      phone: updateData.phone,
    });
    
    if (!updateSuccess) {
      console.error("Failed to update user profile using updateUserProfile function");
      
      // Fallback to direct Supabase update
      console.log("Attempting direct Supabase update");
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);
      
      if (error) {
        console.error("Error updating user profile in database:", error);
        return NextResponse.json(
          { success: false, message: "Failed to update profile in database", error: error },
          { status: 500 }
        );
      }
    }
    
    // Update user metadata using admin client
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            name: updateData.name,
            phone: updateData.phone,
          }
        }
      );
      
      if (authError) {
        console.error("Error updating user metadata:", authError);
        // Continue with the response, as this is not critical
      } else {
        console.log("User metadata updated successfully");
      }
    } catch (authError) {
      console.error("Error updating user metadata:", authError);
      // Continue with the response, as this is not critical
    }
    
    console.log("User profile updated successfully");
    
    // Verify the update by fetching the updated profile
    const { data: updatedProfile, error: verifyError } = await supabase
      .from("users")
      .select("id, name, email, phone, role, created_at, updated_at")
      .eq("id", userId)
      .single();
    
    if (verifyError) {
      console.error("Error verifying profile update:", verifyError);
    } else {
      console.log("Verified updated profile:", updatedProfile);
    }
    
    // Return the updated user data
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedProfile?.id,
        name: updatedProfile?.name,
        email: updatedProfile?.email,
        phone: updatedProfile?.phone,
        role: updatedProfile?.role,
        createdAt: updatedProfile?.created_at,
        updatedAt: updatedProfile?.updated_at
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile", error: JSON.stringify(error) },
      { status: 500 }
    );
  }
} 