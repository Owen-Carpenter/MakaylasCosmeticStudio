'use client';

import { useState } from "react";
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
  AlertDescription
} from "@/components/ui/alert";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Show success message
      setIsSubmitted(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the password reset email. Please try again.";
      setError(errorMessage);
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
      </div>
      
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-5xl font-bold gradient-text">Servify</h1>
          <p className="mt-2 text-white/70">Your Service Marketplace</p>
        </Link>
      </div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
        </div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/login')}
              className="p-0 h-8 mr-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Button>
          </div>
          <CardTitle className="text-2xl text-center gradient-text">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {error && (
            <Alert className="mb-4 bg-destructive/15 border-destructive/20">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="mb-4 mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm mb-4">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                If you don&apos;t see it in your inbox, please check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? "Sending..." : "Send Reset Link"}
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