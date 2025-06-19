"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="min-h-screen gradient-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-40 h-40 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-white rounded-full animate-pulse delay-200"></div>
            <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-white rounded-full animate-pulse delay-400"></div>
          </div>
          <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden z-10 relative">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-center pt-8 pb-10">
              <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mb-3">
                <XCircle className="h-10 w-10 text-rose-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Booking Cancelled</CardTitle>
              <CardDescription className="text-white/90 mt-1">
                Your booking process was not completed
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6 bg-white">
              <div className="space-y-4 text-center">
                <p className="text-gray-600">
                  You&apos;ve cancelled the booking process. No charges have been made to your account.
                </p>
                <p className="text-gray-600">
                  If you encountered any issues or have questions about our services, please contact our support team.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-2 flex flex-col space-y-3 bg-white">
              <Link href="/services" className="w-full">
                <Button variant="default" className="w-full bg-rose-600 hover:bg-rose-700">
                  Browse Services
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-50">
                  Return to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 