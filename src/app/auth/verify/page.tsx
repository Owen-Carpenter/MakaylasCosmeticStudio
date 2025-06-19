'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from 'lucide-react';

function VerifyContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function verifyEmail() {
      try {
        // Get the token and type from the URL
        const token = searchParams?.get('token');
        const type = searchParams?.get('type');

        if (!token || type !== 'email_verification') {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link. Please request a new verification email.');
          return;
        }

        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          setErrorMessage(error.message || 'Failed to verify your email. The link may have expired.');
        } else {
          setVerificationStatus('success');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred during verification.');
      }
    }

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'loading' && 'Verifying your email...'}
            {verificationStatus === 'success' && 'Email verification successful!'}
            {verificationStatus === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center justify-center">
          {verificationStatus === 'loading' && (
            <div className="py-8 flex flex-col items-center">
              <Loader2Icon className="h-12 w-12 text-primary animate-spin mb-4" />
              <p>Please wait while we verify your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-600">
                Your email has been successfully verified! You will be redirected to the login page shortly.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'error' && (
            <Alert className="bg-destructive/15 border-destructive/20">
              <XCircleIcon className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive">
                {errorMessage || 'An error occurred during verification.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationStatus !== 'loading' && (
            <Button 
              onClick={() => router.push('/auth/login')}
              variant={verificationStatus === 'success' ? 'default' : 'outline'}
            >
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 flex flex-col items-center">
            <Loader2Icon className="h-12 w-12 text-primary animate-spin mb-4" />
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
} 