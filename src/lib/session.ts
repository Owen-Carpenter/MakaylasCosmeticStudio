import { supabase } from "./auth";
import { UserProfile, getUserProfile } from "./auth";

/**
 * Get the currently authenticated user
 * @returns The user profile or null if not authenticated
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    // Get the session information from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    // Fetch the user profile data
    const userProfile = await getUserProfile(session.user.id);
    return userProfile;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
} 