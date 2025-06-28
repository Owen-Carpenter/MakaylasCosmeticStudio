"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { SupabaseBooking, getBookingById } from "@/lib/supabase-bookings";
import { Footer } from "@/components/ui/footer";
import { EmailDialog } from "@/components/admin/EmailDialog";
import { PageLoader } from "@/components/ui/page-loader";

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = React.use(params);
  const bookingId = unwrappedParams.id;
  
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<SupabaseBooking | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // Check if user is logged in
        if (status === "loading") return;
        if (!session || !session.user) {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in to view booking details.",
          });
          router.push("/auth/login");
          return;
        }

        // Check if user is admin
        type ExtendedUser = {
          role?: string;
          isAdmin?: boolean;
        };

        const isAdmin = 
          session.user.role === 'admin' || 
          (session.user as ExtendedUser).isAdmin === true;

        if (!isAdmin) {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Authorization Error",
            description: "You don't have permission to access this page.",
          });
          router.push("/dashboard");
          return;
        }

        // Load booking details with customer data (using the improved getBookingById)
        console.log("Loading booking with ID:", bookingId);
        const bookingData = await getBookingById(bookingId);
        
        if (!bookingData) {
          console.error("No booking data returned for ID:", bookingId);
          toast({
            variant: "destructive",
            title: "Booking Not Found",
            description: `No booking found with ID: ${bookingId}. Please check the booking ID and try again.`,
          });
          router.push("/dashboard");
          return;
        }
        
        console.log("Successfully loaded booking data:", bookingData);
        setBooking(bookingData);
      } catch (error) {
        console.error("Error loading booking details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading the booking details.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [session, status, router, bookingId]);

  const handleCancelBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      toast({
        title: "Booking cancelled",
        description: "The booking has been successfully cancelled",
      });
      
      // Update local state
      if (booking) {
        setBooking({ ...booking, status: 'cancelled' });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
      });
    }
  };

  const handleDeletePendingBooking = async () => {
    try {
      const response = await fetch('/api/bookings/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete booking');
      }
      
      toast({
        title: "Booking deleted",
        description: "The pending booking has been successfully deleted",
      });
      
      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error deleting this booking",
      });
    }
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Booking Details" 
        subMessage="Please wait while we fetch the booking information..." 
      />
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">Booking Not Found</h2>
            <Button onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => router.back()}
            >
              Back
            </Button>
            
            <h1 className="text-2xl font-bold text-white">Booking Details</h1>
            
            <div className="w-[70px]"></div> {/* Empty div for spacing */}
          </div>
          
          <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex justify-between items-center">
                <CardTitle>{booking.service_name}</CardTitle>
                <Badge className={(() => {
                  // Check if booking is in the past to show completed status
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const appointmentDate = new Date(booking.appointment_date);
                  const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
                  const isDateInPast = appointmentDateOnly < today;
                  
                  const displayStatus = booking.status === 'confirmed' && isDateInPast ? 'completed' : booking.status;
                  
                  return displayStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                    displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    displayStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800';
                })()}>
                  {(() => {
                    // Check if booking is in the past to show completed status
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const appointmentDate = new Date(booking.appointment_date);
                    const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
                    const isDateInPast = appointmentDateOnly < today;
                    
                    const displayStatus = booking.status === 'confirmed' && isDateInPast ? 'completed' : booking.status;
                    return displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
                  })()}
                </Badge>
              </div>
              <CardDescription>
                Booking ID: {booking.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Appointment Date & Time</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <p>{format(new Date(booking.appointment_date), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <p>{booking.appointment_time}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer</h3>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <p className="font-medium">{booking.customer_name || 'Unknown Customer'}</p>
                    </div>
                    {booking.customer_email && (
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        <p>{booking.customer_email}</p>
                      </div>
                    )}
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>ID: {booking.user_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment</h3>
                    <p>Status: {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}</p>
                    <p>Amount: ${booking.amount_paid}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Additional Details</h3>
                    <p>Created at: {format(new Date(booking.created_at), 'MMM d, yyyy h:mm a')}</p>
                    <p>Service ID: {booking.service_id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-secondary/10 flex flex-wrap gap-4 justify-end">
              {booking.status === 'pending' && (
                <Button
                  variant="outline"
                  className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                  onClick={handleDeletePendingBooking}
                >
                  Delete Pending Booking
                </Button>
              )}
              {(() => {
                // Check if booking is in the past
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const appointmentDate = new Date(booking.appointment_date);
                const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
                const isDateInPast = appointmentDateOnly < today;
                
                // Only show reschedule/cancel for confirmed bookings that are not in the past
                return booking.status === 'confirmed' && !isDateInPast && (
                  <>
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-blue-50 hover:text-blue-600 border-blue-200 text-blue-600"
                      onClick={() => router.push(`/admin/bookings/${booking.id}/reschedule`)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                      onClick={handleCancelBooking}
                    >
                      Cancel Booking
                    </Button>
                  </>
                );
              })()}
              {booking.customer_email && (
                <EmailDialog 
                  customerEmail={booking.customer_email}
                  customerName={booking.customer_name || 'Customer'}
                />
              )}
              <Button
                variant="default"
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 