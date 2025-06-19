import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./auth";

export const authOptions: NextAuthOptions = {
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
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
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
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        
        // Fetch the latest user data from Supabase
        const { data: userData, error } = await supabase
          .from("users")
          .select("name, email, phone, role, created_at, updated_at")
          .eq("id", token.sub)
          .single();
        
        if (userData && !error) {
          session.user.name = userData.name;
          session.user.email = userData.email;
          session.user.phone = userData.phone;
          session.user.role = userData.role;
          // Note: createdAt and updatedAt are not available in the Session type
          // session.user.createdAt = userData.created_at;
          // session.user.updatedAt = userData.updated_at;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}; 