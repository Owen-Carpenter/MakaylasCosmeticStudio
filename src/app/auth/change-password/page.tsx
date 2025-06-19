'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Lock, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/auth";
import { Footer } from "@/components/ui/footer";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      setStatus("error");
      return;
    }

    // Password validation
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsLoading(false);
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");

      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sessionStatus === "authenticated" ? session?.user?.email || "" : "",
        password: currentPassword,
      });

      if (signInError) {
        setStatus("error");
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Password updated successfully
      setStatus("success");
      
      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: unknown) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      setError(errorMessage);
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    // Redirect to login if not authenticated
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow gradient-bg py-24">
        <div className="max-w-md mx-auto px-4">
          <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
            </div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center mb-2">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="p-0 h-8 mr-2 text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-2xl text-center gradient-text">Change Password</CardTitle>
              <CardDescription className="text-center">
                Update your account password
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {status === "success" && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Success</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your password has been updated successfully. You will be redirected shortly.
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      className="pl-10"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isLoading || status === "success"}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      className="pl-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading || status === "success"}
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
                      disabled={isLoading || status === "success"}
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" 
                  type="submit" 
                  disabled={isLoading || status === "success"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center pb-6 pt-2 relative z-10">
              <div className="text-sm text-muted-foreground">
                <Link
                  href="/dashboard"
                  className="text-primary hover:text-primary/80 font-medium underline-offset-4 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 