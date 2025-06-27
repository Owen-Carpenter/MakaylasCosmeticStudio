"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/auth";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { CheckCircle, User, Mail, Phone, Lock, UserPlus, Loader2 } from "lucide-react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

// Register schema
const registerSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationSuccess = searchParams?.get('verified') === 'true';

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerUser(
        data.email,
        data.password,
        {
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone
        }
      );

      if (result.success) {
        // Show email verification message
        setEmailSent(true);
        form.reset();
      } else {
        // Show error message
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // If verification was successful, show success message
  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <Card className="w-full backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl text-center gradient-text">Email Verified</CardTitle>
              <CardDescription className="text-center">
                Your email has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription className="text-emerald-600">
                  Your email has been verified. You can now sign in to your account.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" 
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If email was sent successfully, show verification message
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <Card className="w-full backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/30 rounded-full"></div>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl text-center gradient-text">Check Your Email</CardTitle>
              <CardDescription className="text-center">
                Verification email has been sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Alert className="border-0 bg-purple-50">
                <Mail className="h-4 w-4 text-purple-600" />
                <AlertTitle>Email Verification Required</AlertTitle>
                <AlertDescription className="text-purple-600">
                  We&apos;ve sent a verification email to your inbox. Please check your email and click on the verification link to complete your registration.
                </AlertDescription>
              </Alert>
              <div className="text-sm text-muted-foreground">
                <p>Once verified, you will be able to sign in to your account.</p>
                <p className="mt-2">Didn&apos;t receive an email? Check your spam folder or try registering again.</p>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" 
                onClick={() => router.push("/auth/login")}
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          <CardHeader className="space-y-1 relative z-10">
            <CardTitle className="text-2xl text-center font-bold gradient-text">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {error && (
              <Alert className="bg-destructive/15 border-destructive/20">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <OAuthButtons 
                callbackUrl="/dashboard"
                disabled={isLoading}
                mode="signup"
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/50 backdrop-blur-sm px-2 text-muted-foreground">
                Or with email
              </span>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="John" {...field} disabled={isLoading} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Doe" {...field} disabled={isLoading} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input className="pl-10" placeholder="your@email.com" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input className="pl-10" placeholder="(123) 456-7890" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input className="pl-10" type="password" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input className="pl-10" type="password" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200" type="submit" disabled={isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="relative z-10">
            <div className="text-sm text-center w-full text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium underline-offset-4 transition-colors hover:text-primary/80"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin h-16 w-16" />}>
      <RegisterContent />
    </Suspense>
  );
} 