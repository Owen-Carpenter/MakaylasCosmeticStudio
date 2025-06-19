"use client";

import React, { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { PageLoader } from "@/components/ui/page-loader";

// Dynamically import the AdminDashboard component
const AdminDashboard = dynamic(() => import('@/components/dashboard/AdminDashboard'), {
  loading: () => (
    <PageLoader 
      message="Loading Admin Dashboard" 
      subMessage="Please wait while we prepare your admin experience..." 
    />
  ),
});

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in but not admin, redirect to the customer dashboard page
    if (status === "authenticated" && session?.user && session.user.role !== "admin") {
      router.replace('/dashboard/customer');
    }
  }, [session, status, router]);
  
  if (status === "loading") {
    return (
      <PageLoader 
        message="Preparing Your Dashboard" 
        subMessage="Please wait while we authenticate your session..." 
      />
    );
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">You are not logged in</h2>
            <Button onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is admin, show admin dashboard
  if (session.user.role === 'admin') {
    return <AdminDashboard />;
  }
  
  // For regular users, we'll show a redirecting message
  // The useEffect above will handle the actual redirect
  return (
    <PageLoader 
      message="Redirecting to Customer Dashboard" 
      subMessage="Please wait while we take you to your dashboard..." 
    />
  );
} 