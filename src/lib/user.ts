import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/auth";

// User role
export type UserRole = 'user' | 'provider' | 'admin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Payment information
  paymentMethods?: Array<{
    id: string;
    type: string;
    lastFour: string;
    expiryDate: string;
    isDefault: boolean;
  }>;
}

/**
 * Get the current user's profile from Supabase
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    // Get current authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Get user profile from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      // If user doesn't exist in our users table, create a basic profile
      const newUser = {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: 'user' as UserRole,
        phone: '',
        created_at: authUser.created_at,
        last_login_at: authUser.last_sign_in_at,
        preferences: {
          notifications: true,
          emailUpdates: true,
          darkMode: false
        },
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      };
      
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert(newUser);
      
      if (insertError) {
        console.error("Error creating user profile:", insertError);
        return null;
      }
      
      // Use the newly created user data
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: authUser.user_metadata?.avatar_url,
        phone: newUser.phone,
        createdAt: new Date(newUser.created_at || Date.now()),
        lastLoginAt: new Date(newUser.last_login_at || Date.now()),
        preferences: newUser.preferences,
        address: newUser.address,
        paymentMethods: []
      };
    }
    
    // Map the Supabase user to our User interface
    return {
      id: data.id,
      name: data.name || authUser.user_metadata?.full_name || 'User',
      email: data.email || authUser.email || '',
      role: (data.role || 'user') as UserRole,
      phone: data.phone || '',
      avatar: authUser.user_metadata?.avatar_url,
      createdAt: new Date(data.created_at || authUser.created_at || Date.now()),
      lastLoginAt: new Date(data.last_login_at || authUser.last_sign_in_at || Date.now()),
      preferences: {
        notifications: data.preferences?.notifications ?? true,
        emailUpdates: data.preferences?.emailUpdates ?? true,
        darkMode: data.preferences?.darkMode ?? false
      },
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      // Real payment methods would be fetched from a payment provider like Stripe
      paymentMethods: data.payment_methods || []
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

/**
 * Update the user's profile
 * @param userData Partial user data to update
 * @returns The updated user
 */
export async function updateUserProfile(userData: Partial<User>): Promise<User | null> {
  try {
    // Get current authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Format the data to update
    const updateData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      preferences: userData.preferences,
      updated_at: new Date().toISOString()
    };
    
    // Update the user data in Supabase
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authUser.id);
    
    if (error) {
      console.error("Error updating user profile:", error);
      toast({
        variant: "destructive",
        title: "Error Updating Profile",
        description: "There was a problem updating your profile.",
      });
      return null;
    }
    
    toast({
      variant: "success",
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });

    // Return the updated user
    return getUserProfile();
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "There was a problem updating your profile.",
    });
    return null;
  }
}

/**
 * Update user preferences
 * @param preferences User preferences to update
 * @returns The updated user
 */
export async function updateUserPreferences(
  preferences: Partial<User["preferences"]>
): Promise<User | null> {
  try {
    // Get current authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Get current preferences
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', authUser.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching user preferences:", fetchError);
      return null;
    }
    
    // Update the preferences
    const updatedPreferences = {
      ...(data?.preferences || {
        notifications: true,
        emailUpdates: true,
        darkMode: false
      }),
      ...preferences,
    };
    
    const { error } = await supabase
      .from('users')
      .update({ preferences: updatedPreferences })
      .eq('id', authUser.id);
    
    if (error) {
      console.error("Error updating user preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating your preferences.",
      });
      return null;
    }

    toast({
      variant: "success",
      title: "Preferences Updated",
      description: "Your preferences have been saved",
    });

    return getUserProfile();
  } catch (error) {
    console.error("Error in updateUserPreferences:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "There was a problem updating your preferences.",
    });
    return null;
  }
} 