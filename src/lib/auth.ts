import { createClient } from "@supabase/supabase-js";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
}

// Initialize Supabase client for client-side operations
// Safe to use public anon key in client browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Function to fetch user profile data from Supabase
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, role")
    .eq("id", userId)
    .single();
  
  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data as UserProfile;
}

// Function to update user profile data
export async function updateUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  console.log("Updating user profile with data:", profile);
  
  try {
    // First, get the current user data to ensure we have all fields
    const currentProfile = await getUserProfile(profile.id);
    
    // Create update object, preserving existing values if not provided
    const updateData = {
      name: profile.name ?? currentProfile?.name ?? null,
      phone: profile.phone ?? currentProfile?.phone ?? null,
    };
    
    console.log("Final update data after merging with current profile:", updateData);
    
    // Perform the update
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", profile.id)
      .select(); // Add select to return the updated data
    
    if (error) {
      console.error("Error updating user profile:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }
    
    console.log("Profile update successful, updated data:", data);
    return true;
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error);
    return false;
  }
}

// Registration helper function
export async function registerUser(
  email: string,
  password: string,
  userData: { 
    name: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Registration attempt for:", email);
    
    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone || null,
          role: "customer", // Default role for new users
        },
      },
    });

    if (authError) {
      console.error("Supabase Auth signup error:", authError);
      return { success: false, error: authError.message };
    }

    console.log("Auth signup successful, user ID:", data?.user?.id);

    // After successful auth signup, ensure user exists in the users table
    if (data && data.user) {
      try {
        // Skip the existence check since it's causing 406 errors
        // Instead, try to directly insert with ON CONFLICT DO NOTHING

        // Prepare user data for insertion
        const newUser = {
          id: data.user.id,
          name: userData.name,
          email: data.user.email,
          phone: userData.phone || null,
          role: "customer", // Default role
        };
        
        console.log("Inserting new user into users table:", newUser);
        
        // Use upsert operation (insert with on conflict do nothing)
        const { error: insertError } = await supabase
          .from("users")
          .upsert(newUser, { onConflict: 'id' });

        if (insertError) {
          console.error("Error upserting user into users table:", insertError);
          console.error("Insert error details:", {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details
          });
        } else {
          console.log("User successfully upserted into users table");
        }
      } catch (dbError) {
        console.error("Unexpected error during user database operations:", dbError);
        // Don't fail the overall registration process due to DB issues
      }
    }

    // User created successfully in Auth, even if DB insert had issues
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred during registration" 
    };
  }
} 