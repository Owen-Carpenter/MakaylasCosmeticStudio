"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { Footer } from "@/components/ui/footer";

interface BookingDetails {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  payment_intent: string;
  amount_paid: number;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  service?: string;
  date?: string;
  time?: string;
  amount?: string;
  stripe_session?: {
    payment_status?: string;
    status?: string;
  };
}

// Helper function to send payment receipt email via API
async function sendPaymentReceiptEmailAPI(booking: BookingDetails, session: Session | null) {
  try {
    // Ensure we have the minimum required data before attempting to send
    const email = session?.user?.email;
    const name = session?.user?.name || 'Customer';
    const bookingId = booking.id;
    const serviceName = booking.service_name || booking.service;
    const date = booking.appointment_date || booking.date;
    const time = booking.appointment_time || booking.time;
    const amount = booking.amount_paid 
      ? `$${booking.amount_paid}` 
      : (booking.amount || '0');

    // Log the data being sent for debugging
    console.log('Sending receipt email with data:', {
      email,
      name,
      bookingId,
      serviceName,
      date,
      time,
      amount,
      hasEmail: !!email,
      hasBookingId: !!bookingId,
      hasServiceName: !!serviceName,
      hasDate: !!date,
      hasTime: !!time
    });

    // Check for missing critical data
    if (!email) {
      console.log('Cannot send receipt email: No email address available');
      return;
    }

    if (!bookingId || !serviceName || !date || !time) {
      console.log('Cannot send receipt email: Missing booking details', {
        bookingId: !!bookingId,
        serviceName: !!serviceName,
        date: !!date,
        time: !!time
      });
      return;
    }

    const response = await fetch('/api/email/send-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        bookingId,
        serviceName,
        date,
        time,
        amount
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('Payment receipt email sent successfully');
    } else {
      console.error('Failed to send payment receipt email:', result.error);
    }
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
  }
}

function BookingSuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch booking details from the API
    const fetchBookingDetails = async () => {
      try {
        if (!sessionId) {
          setError("No session ID provided");
          setLoading(false);
          return;
        }

        // First, trigger an update of any pending bookings that might have been paid
        if (session?.user?.id) {
          try {
            await fetch('/api/bookings/updatePendingStatus', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: session.user.id }),
            });
            console.log("Triggered update of pending bookings");
          } catch (error) {
            console.error("Error updating pending bookings:", error);
          }
        }

        const response = await fetch(`/api/bookings/details?sessionId=${sessionId}`, {
          credentials: "include"
        });
        const data = await response.json();
        
        if (data.success && data.booking) {
          setBookingDetails(data.booking);
          
          // Check if payment is confirmed either in our database or on Stripe's side
          const stripePaymentComplete = data.booking.stripe_session?.payment_status === 'paid' || 
                                        data.booking.stripe_session?.status === 'complete';
          const bookingConfirmed = data.booking.status === 'confirmed';
          
          // If Stripe shows payment complete but our database still shows pending, 
          // try to update it immediately
          if (stripePaymentComplete && !bookingConfirmed) {
            console.log("Payment is complete on Stripe but booking is still pending, attempting to update...");
            try {
              // Force update the specific booking
              await fetch('/api/bookings/updatePendingStatus', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: session?.user?.id }),
              });
              
              // Refetch booking details after update attempt
              const updatedResponse = await fetch(`/api/bookings/details?sessionId=${sessionId}`, {
                credentials: "include"
              });
              const updatedData = await updatedResponse.json();
              if (updatedData.success && updatedData.booking) {
                setBookingDetails(updatedData.booking);
              }
            } catch (updateError) {
              console.error("Error updating booking status:", updateError);
            }
          }
          
          // Send email receipt if booking is confirmed or payment is complete
          if ((data.booking.status === 'confirmed' || stripePaymentComplete) && !emailSent) {
            await sendPaymentReceiptEmailAPI(data.booking, session);
          }
        } else {
          setError(data.message || "Failed to retrieve booking details");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError("An error occurred while retrieving your booking details");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchBookingDetails();
      
      // Enhanced polling to check for booking status updates
      const statusCheckInterval = setInterval(async () => {
        try {
          if (!sessionId) return;
          
          const response = await fetch(`/api/bookings/details?sessionId=${sessionId}`, {
            credentials: "include"
          });
          const data = await response.json();
          
          if (data.success && data.booking) {
            setBookingDetails(data.booking);
            
            // Check if booking is confirmed OR payment is complete on Stripe's side
            const stripePaymentComplete = data.booking.stripe_session?.payment_status === 'paid' || 
                                          data.booking.stripe_session?.status === 'complete';
            const bookingConfirmed = data.booking.status === 'confirmed';
                                          
            if (bookingConfirmed || stripePaymentComplete) {
              clearInterval(statusCheckInterval);
              
              // If payment is complete but booking not confirmed, try one more update
              if (stripePaymentComplete && !bookingConfirmed) {
                try {
                  await fetch('/api/bookings/updatePendingStatus', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: session?.user?.id }),
                  });
                } catch (updateError) {
                  console.error("Error in final update attempt:", updateError);
                }
              }
              
              // Send email receipt if not sent already
              if (!emailSent) {
                await sendPaymentReceiptEmailAPI(data.booking, session);
              }
            }
          }
        } catch (error) {
          console.error("Error polling booking status:", error);
        }
      }, 3000); // Check every 3 seconds instead of 5
      
      // Clear interval after 30 seconds to avoid infinite polling
      setTimeout(() => {
        clearInterval(statusCheckInterval);
      }, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(statusCheckInterval);
    } else {
      setLoading(false);
    }
  }, [sessionId, emailSent, session]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg pt-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-60 h-60 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
        <div className="animate-pulse flex flex-col items-center relative z-10">
          <div className="h-12 w-12 rounded-full bg-white mb-4"></div>
          <div className="h-4 w-48 bg-white/80 rounded mb-2"></div>
          <div className="h-3 w-32 bg-white/60 rounded"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
          <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-yellow-400 rounded-full animate-pulse delay-400"></div>
        </div>
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden z-10 relative">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-center pt-8 pb-10">
            <CardTitle className="text-2xl font-bold">Booking Status</CardTitle>
            <CardDescription className="text-white/90 mt-1">
              There was an issue retrieving your booking details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 bg-white">
            <p className="text-gray-600 text-center">{error}</p>
            <p className="text-gray-600 text-center mt-4">
              If you have completed a payment, your booking is still valid. Please check your email for confirmation details or contact customer support.
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-2 flex flex-col space-y-3 bg-white">
            <Link href="/dashboard" className="w-full">
              <Button variant="default" className="w-full bg-rose-600 hover:bg-rose-700">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render the card content based on booking status
  const renderCardContent = () => {
    // If stripe session shows payment success but webhook hasn't updated booking yet, still show confirmed
    const stripePaymentComplete = bookingDetails?.stripe_session?.payment_status === 'paid' || 
                                  bookingDetails?.stripe_session?.status === 'complete';
    
    // If booking is pending AND payment is not complete on Stripe's side, show processing
    if (bookingDetails?.status === 'pending' && !stripePaymentComplete) {
      return (
        <>
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center pt-8 pb-10">
            <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mb-3">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Payment Processing</CardTitle>
            <CardDescription className="text-white/90 mt-1">
              Your booking is being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 bg-white">
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Booking Details</h3>
              <p className="text-sm text-gray-600">
                Confirmation #{bookingDetails?.id}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg mb-4 border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Payment is being processed.</strong> Your booking is pending confirmation. 
                Once payment is verified, your booking will be automatically confirmed, and you&apos;ll receive an 
                email confirmation.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">
                  {bookingDetails?.service_name || bookingDetails?.service}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {bookingDetails?.appointment_date ? 
                    new Date(bookingDetails.appointment_date).toLocaleDateString() : 
                    bookingDetails?.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {bookingDetails?.appointment_time || bookingDetails?.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                  Processing
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t mt-3">
                <span className="text-gray-800 font-medium">Amount Paid:</span>
                <span className="font-bold text-emerald-600">
                  ${typeof bookingDetails?.amount_paid === 'number' 
                    ? bookingDetails.amount_paid.toFixed(2) 
                    : bookingDetails?.amount}
                </span>
              </div>
              {emailSent && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-md text-sm">
                  A receipt has been sent to your email.
                </div>
              )}
            </div>
          </CardContent>
        </>
      );
    }
    
    // Default - confirmed booking
    return (
      <>
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center pt-8 pb-10">
          <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mb-3">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Booking Confirmed!</CardTitle>
          <CardDescription className="text-white/90 mt-1">
            Thank you for your booking
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6 bg-white">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Booking Details</h3>
            <p className="text-sm text-gray-600">
              Confirmation #{bookingDetails?.id}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">
                {bookingDetails?.service_name || bookingDetails?.service}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {bookingDetails?.appointment_date ? 
                  new Date(bookingDetails.appointment_date).toLocaleDateString() : 
                  bookingDetails?.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {bookingDetails?.appointment_time || bookingDetails?.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-emerald-500" />
                Confirmed
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t mt-3">
              <span className="text-gray-800 font-medium">Amount Paid:</span>
              <span className="font-bold text-emerald-600">
                ${typeof bookingDetails?.amount_paid === 'number' 
                  ? bookingDetails.amount_paid.toFixed(2) 
                  : bookingDetails?.amount}
              </span>
            </div>
            {emailSent && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-md text-sm">
                A receipt has been sent to your email.
              </div>
            )}
          </div>
        </CardContent>
      </>
    );
  };
  
  return (
    <div className="min-h-screen gradient-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
        <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-yellow-400 rounded-full animate-pulse delay-400"></div>
      </div>
      
      {/* Card with dynamic content based on booking status */}
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden z-10 relative">
        {renderCardContent()}
        
        <CardFooter className="px-6 pb-6 pt-4 flex flex-col space-y-3 bg-white">
          <Link href="/dashboard" className="w-full">
            <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="animate-spin h-16 w-16" />
            </div>
          }>
            <BookingSuccessPageContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
} 