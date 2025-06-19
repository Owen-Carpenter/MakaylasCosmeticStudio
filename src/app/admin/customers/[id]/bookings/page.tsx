"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BadgeCheck, X, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";
import { Footer } from "@/components/ui/footer";
import { SupabaseBooking } from "@/lib/supabase-bookings";
import { EmailDialog } from "@/components/admin/EmailDialog";
import { PageLoader } from "@/components/ui/page-loader";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

export default function CustomerBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = React.use(params);
  const customerId = unwrappedParams.id;
  
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<SupabaseBooking[]>([]);
  const router = useRouter();

  // Initialize Supabase with service role for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

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
            description: "Please log in to view customer bookings.",
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

        // Load customer details
        const { data: customerData, error: customerError } = await supabase
          .from('users')
          .select('id, name, email, phone, role, created_at')
          .eq('id', customerId)
          .single();
        
        if (customerError || !customerData) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Customer not found",
          });
          router.push("/dashboard");
          return;
        }
        
        setCustomer(customerData as UserProfile);
        
        // Load customer bookings using API route for better admin access
        const response = await fetch(`/api/bookings/customer/${customerId}`);
        const bookingResult = await response.json();
        
        if (!bookingResult.success) {
          console.error("Error fetching customer bookings:", bookingResult.message);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load customer bookings.",
          });
          return;
        }
        
        // Add customer info to bookings for EmailDialog
        const bookingsWithCustomerInfo = (bookingResult.bookings || []).map((booking: SupabaseBooking) => ({
          ...booking,
          customer_name: customerData.name,
          customer_email: customerData.email
        })) as SupabaseBooking[];
        
        setBookings(bookingsWithCustomerInfo);
      } catch (error) {
        console.error("Error loading customer bookings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading the customer bookings.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [customerId, session, status, router]);

  const handleCancelBooking = async (bookingId: string) => {
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
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Customer Bookings" 
        subMessage="Please wait while we fetch the booking history..." 
      />
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">Customer Not Found</h2>
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
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer
            </Button>
            
            <h1 className="text-2xl font-bold text-white">Customer Bookings</h1>
            
            <div className="w-[110px]"></div> {/* Empty div for spacing */}
          </div>
          
          <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{customer.name || "Customer"}&apos;s Bookings</CardTitle>
                  <CardDescription>
                    {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
                  </CardDescription>
                </div>
                
                {customer.email && (
                  <EmailDialog
                    customerEmail={customer.email}
                    customerName={customer.name || "Customer"}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length > 0 ? (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {bookings.map((booking) => {
                    // Check if booking is in the past to show completed status
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const appointmentDate = new Date(booking.appointment_date);
                    const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
                    const isDateInPast = appointmentDateOnly < today;
                    
                    const displayStatus = booking.status === 'confirmed' && isDateInPast ? 'completed' : booking.status;
                    
                    return (
                    <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="sm:mr-4 self-start sm:self-center">
                        {displayStatus === 'confirmed' ? (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                        ) : displayStatus === 'completed' ? (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                          </div>
                        ) : displayStatus === 'pending' ? (
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{booking.service_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.appointment_date), 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount: ${booking.amount_paid} • {booking.payment_status === 'paid' ? 'Payment Complete' : 'Payment Pending'}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                        <Badge className={
                          displayStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                          displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          displayStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                        </Badge>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white"
                            onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                          >
                            Details
                          </Button>
                          {booking.status === 'confirmed' && !isDateInPast && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-blue-50 hover:text-blue-600 border-blue-200 text-blue-600"
                                onClick={() => router.push(`/admin/bookings/${booking.id}/reschedule`)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">This customer has not made any bookings yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 