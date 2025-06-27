'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { CheckCircle, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const registrationSuccess = searchParams?.get('registered') === 'true';
  const verificationSuccess = searchParams?.get('verified') === 'true';
  const passwordResetSuccess = searchParams?.get('reset') === 'success';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("Login attempt for:", email);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("Sign in result:", result);

      if (!result?.error) {
        router.push(callbackUrl);
      } else {
        setIsLoading(false);
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(result.error);
        }
        console.error("Login error:", result.error);
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again later.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
      <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
      </div>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
                            <h1 className="text-5xl font-bold gradient-text">Makayla&apos;s Cosmetic Studio</h1>
            <p className="mt-2 text-white/70">Premium Beauty Services</p>
          </Link>
        </div>
        
        <Card className="w-full backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl text-center gradient-text">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {registrationSuccess && (
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Registration Successful</AlertTitle>
                <AlertDescription className="text-emerald-600">
                  Your account has been created. Please check your email to verify your account.
                </AlertDescription>
              </Alert>
            )}
            
            {verificationSuccess && (
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Email Verified</AlertTitle>
                <AlertDescription className="text-emerald-600">
                  Your email has been verified. You can now sign in to your account.
                </AlertDescription>
              </Alert>
            )}

            {passwordResetSuccess && (
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Password Reset Successful</AlertTitle>
                <AlertDescription className="text-emerald-600">
                  Your password has been reset successfully. You can now sign in with your new password.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-destructive/15 border-destructive/20">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <OAuthButtons 
                callbackUrl={callbackUrl}
                disabled={isLoading}
                mode="signin"
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/50 backdrop-blur-sm px-2 text-muted-foreground">
                Or with email
              </span>
            </div>
            
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium underline-offset-4 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
              <Button className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" type="submit" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="relative z-10">
            <div className="text-sm text-center w-full text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-medium underline-offset-4 transition-colors hover:text-primary/80"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 