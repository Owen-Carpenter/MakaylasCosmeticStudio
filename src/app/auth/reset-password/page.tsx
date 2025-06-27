'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Alert, 
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state change when user clicks on the password reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User has clicked the password reset link and is ready to set a new password
        console.log("Password recovery event detected");
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      setStatus("loading");

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Password updated successfully
      setStatus("success");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login?reset=success');
      }, 3000);
    } catch (error: unknown) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      setError(errorMessage);
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
      <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
      </div>
      
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
                      <h1 className="text-5xl font-bold gradient-text">Makayla&apos;s Cosmetic Studio</h1>
                      <p className="mt-2 text-white/70">Premium Beauty Services</p>
        </Link>
      </div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
        </div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl text-center gradient-text">Set New Password</CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                Your password has been updated successfully. You will be redirected to the login page shortly.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mb-4 bg-destructive/15 border-destructive/20">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">Error</AlertTitle>
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6 pt-2 relative z-10">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 