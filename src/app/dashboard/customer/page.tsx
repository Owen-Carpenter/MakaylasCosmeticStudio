"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import { PageLoader } from "@/components/ui/page-loader";

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
            <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pass the user ID to the CustomerDashboard component
  return <CustomerDashboard userId={session.user.id} />;
} 