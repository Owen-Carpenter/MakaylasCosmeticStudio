import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { getBaseUrl, getAuthRedirectUrl } from "@/lib/utils/url";

// Type extensions for role-based access
declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phone?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    phone?: string;
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Supabase admin client for user creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Create NextAuth handler with explicit exports
const handler = NextAuth({
  // Authentication providers: OAuth and credentials
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials:", { email: !!credentials?.email, password: !!credentials?.password });
          return null;
        }

        try {
          console.log("Attempting Supabase login for:", credentials.email);
          
          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase auth error:", error.message, error);
            return null;
          }

          if (!data?.user) {
            console.error("No user returned from Supabase");
            return null;
          }

          console.log("Supabase login successful, user ID:", data.user.id);
          
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, name, email, phone, role")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            
            // User exists in auth but not in users table, create a profile
            if (profileError.code === 'PGRST116') { // No rows returned
              console.log("User profile not found, creating one");
              
              const newProfile = {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || null,
                email: data.user.email,
                phone: data.user.user_metadata?.phone || null,
                role: "customer", // Default role
              };
              
              const { error: insertError } = await supabase
                .from("users")
                .insert(newProfile);
                
              if (insertError) {
                console.error("Error creating user profile:", insertError);
              } else {
                console.log("Created user profile successfully");
                // Use the newly created profile
                return {
                  id: data.user.id,
                  email: data.user.email,
                  name: newProfile.name,
                  phone: newProfile.phone,
                  role: newProfile.role,
                };
              }
            }
          }

          // Return user with role information
          return {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || data.user.email?.split('@')[0] || null,
            phone: profile?.phone || null,
            role: profile?.role || "customer", // Default role
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  
  // Use JWT for session management
  session: {
    strategy: "jwt",
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  events: {
    async linkAccount({ user, account }) {
      console.log("Account linked:", { 
        userId: user.id, 
        provider: account.provider, 
        providerAccountId: account.providerAccountId 
      });
    },
  },
  
  callbacks: {
    // Handle OAuth sign-in and user creation
    async signIn({ user, account, profile }) {
      // If it's an OAuth provider (not credentials), create user profile in Supabase
      if (account?.provider && account.provider !== "credentials") {
        try {
          console.log("OAuth sign-in attempt:", { 
            provider: account.provider, 
            providerUserId: user.id, 
            email: user.email 
          });

          // Check if user already exists in our users table by email
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("id, name, email, phone, role")
            .eq("email", user.email)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error checking existing user:", fetchError);
            return false;
          }

          // If user doesn't exist, create them in Supabase Auth first, then in users table
          if (!existingUser) {
            console.log("Creating new OAuth user in Supabase Auth");
            
            try {
              // Create user in Supabase Auth system first
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: user.email!,
                email_confirm: true, // Auto-confirm OAuth users
                user_metadata: {
                  name: user.name || profile?.name,
                  avatar_url: user.image,
                  provider: account.provider,
                  provider_id: user.id
                }
              });

              if (authError) {
                console.error("Error creating user in Supabase Auth:", authError);
                return false;
              }

              if (!authData.user) {
                console.error("No user returned from Supabase Auth creation");
                return false;
              }

              console.log("User created in Supabase Auth with ID:", authData.user.id);

              // Now create the user profile in our users table using the Supabase auth user ID
              const newProfile = {
                id: authData.user.id, // Use Supabase auth user ID
                name: user.name || profile?.name || user.email?.split('@')[0] || null,
                email: user.email,
                phone: null, // OAuth providers typically don't provide phone
                role: "customer", // Default role
              };
              
              console.log("New profile data:", newProfile);
              
              const { error: insertError } = await supabase
                .from("users")
                .insert(newProfile);
                
              if (insertError) {
                console.error("Error creating OAuth user profile:", insertError);
                return false;
              } else {
                console.log("OAuth user profile created successfully with ID:", authData.user.id);
                // Update user object with the Supabase auth user ID and role for JWT
                user.id = authData.user.id;
                user.role = "customer";
              }

            } catch (authCreateError) {
              console.error("Failed to create user in Supabase Auth:", authCreateError);
              return false;
            }
          } else {
            console.log("OAuth user already exists, linking account");
            
            try {
              // User exists in our users table, check if they exist in Supabase Auth
              const { data: authUser, error: authFetchError } = await supabaseAdmin.auth.admin.getUserById(existingUser.id);
              
              if (authFetchError || !authUser.user) {
                console.log("User exists in users table but not in Supabase Auth, creating auth user");
                
                // Create the user in Supabase Auth to link the OAuth account
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                  id: existingUser.id, // Use existing user ID to maintain consistency
                  email: user.email!,
                  email_confirm: true,
                  user_metadata: {
                    name: existingUser.name || user.name || profile?.name,
                    avatar_url: user.image,
                    provider: account.provider,
                    provider_id: user.id
                  }
                });

                if (authError) {
                  console.error("Error creating auth user for linking:", authError);
                  return false;
                }
                
                console.log("Auth user created for account linking with ID:", authData.user?.id);
              } else {
                console.log("User exists in both systems, linking OAuth provider");
                
                // Update user metadata to include the new OAuth provider info
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                  existingUser.id,
                  {
                    user_metadata: {
                      ...authUser.user.user_metadata,
                      [`${account.provider}_id`]: user.id,
                      avatar_url: user.image || authUser.user.user_metadata?.avatar_url,
                      name: user.name || profile?.name || authUser.user.user_metadata?.name
                    }
                  }
                );

                if (updateError) {
                  console.error("Error updating user metadata for account linking:", updateError);
                  // Continue anyway, this is not critical
                }
              }
              
              // Update user object with existing profile data
              user.id = existingUser.id;
              user.role = existingUser.role;
              user.phone = existingUser.phone;
              
              console.log("Account linking completed for user:", existingUser.id);
              
            } catch (linkingError) {
              console.error("Error during account linking:", linkingError);
              // If linking fails, still allow sign-in with existing user data
              user.id = existingUser.id;
              user.role = existingUser.role;
              user.phone = existingUser.phone;
            }
          }
        } catch (error) {
          console.error("OAuth sign-in error:", error);
          return false;
        }
      }
      
      return true;
    },
    // Add role to JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "customer";
        token.phone = user.phone || "";
      }
      return token;
    },
    // Pass role to client session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    // Handle redirects after sign-in
    async redirect({ url, baseUrl }) {
      // Get the configured base URL from environment variables
      const appBaseUrl = getBaseUrl();
      
      // If the URL is already absolute (starts with http/https), use it
      if (url.startsWith('http')) {
        // If it's pointing to localhost, redirect to production equivalent
        if (url.includes('localhost:3000')) {
          return url.replace('http://localhost:3000', appBaseUrl);
        }
        return url;
      }
      
      // If it's a relative path, join it with the configured base URL
      if (url.startsWith('/')) return `${appBaseUrl}${url}`;
      
      // Default redirect to services page after successful sign-in
      if (url === baseUrl) return getAuthRedirectUrl('/services');
      
      // Default fallback - return to the configured base URL
      return appBaseUrl;
    },
  },
  
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
  },
  
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
});

// Export the handler directly for Next.js App Router
export const GET = handler;
export const POST = handler;
