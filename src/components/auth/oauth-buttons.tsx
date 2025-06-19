"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface OAuthButtonsProps {
  callbackUrl?: string;
  disabled?: boolean;
  mode?: "signin" | "signup";
}

export function OAuthButtons({ callbackUrl = "/dashboard", disabled = false, mode = "signin" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error(`${provider} authentication error:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const actionText = mode === "signin" ? "Sign in" : "Sign up";

  return (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full backdrop-blur-sm bg-white/80 hover:bg-white/50 shadow-sm border-0 transition-all duration-200"
        onClick={() => handleOAuthLogin("google")}
        disabled={disabled || loadingProvider !== null}
      >
        {loadingProvider === "google" ? (
          <div className="h-4 w-4 mr-2 animate-spin border-2 border-red-500 border-t-transparent rounded-full" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            className="h-4 w-4 mr-2 text-red-500"
            fill="currentColor"
          >
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
        )}
        {actionText} with Google
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full backdrop-blur-sm bg-white/80 hover:bg-white/50 shadow-sm border-0 transition-all duration-200"
        onClick={() => handleOAuthLogin("facebook")}
        disabled={disabled || loadingProvider !== null}
      >
        {loadingProvider === "facebook" ? (
          <div className="h-4 w-4 mr-2 animate-spin border-2 border-blue-600 border-t-transparent rounded-full" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className="h-4 w-4 mr-2 text-blue-600"
            fill="currentColor"
          >
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
          </svg>
        )}
        {actionText} with Facebook
      </Button>
    </div>
  );
} 