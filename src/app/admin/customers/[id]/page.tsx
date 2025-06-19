"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/auth";
import { Footer } from "@/components/ui/footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmailDialog } from "@/components/admin/EmailDialog";
import { PageLoader } from "@/components/ui/page-loader";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = React.use(params);
  const customerId = unwrappedParams.id;
  
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
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
            description: "Please log in to view customer details.",
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
          .select('*')
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
        
        // Get bookings count for this customer using API
        const response = await fetch(`/api/bookings/customer/${customerId}`);
        const bookingResult = await response.json();
        
        if (bookingResult.success) {
          setBookingsCount(bookingResult.bookings?.length || 0);
        }
      } catch (error) {
        console.error("Error loading customer details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading the customer details.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [customerId, session, status, router]);

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Customer Details" 
        subMessage="Please wait while we fetch the customer information..." 
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
              onClick={() => router.back()}
            >
              Back
            </Button>
            
            <h1 className="text-2xl font-bold text-white">Customer Details</h1>
            
            <div className="w-[70px]"></div> {/* Empty div for spacing */}
          </div>
          
          <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {customer.name?.charAt(0) || customer.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{customer.name || "Customer"}</CardTitle>
                    <CardDescription>
                      Member since {format(new Date(customer.created_at), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-white"
                    onClick={() => router.push(`/admin/customers/${customer.id}/bookings`)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Bookings
                  </Button>
                  {customer.email && (
                    <EmailDialog
                      customerEmail={customer.email}
                      customerName={customer.name || "Customer"}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        <p>{customer.email}</p>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-primary" />
                          <p>{customer.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Information</h3>
                    <div className="space-y-2">
                      <p>Customer ID: {customer.id}</p>
                      <p>Role: {customer.role || "Customer"}</p>
                      <div className="flex items-center">
                        <Badge className="bg-blue-100 text-blue-800 mr-2">
                          {bookingsCount} Bookings
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {customer.address && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Address</h3>
                      <p>{customer.address}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Activity</h3>
                    <div className="space-y-2">
                      <p>Created: {format(new Date(customer.created_at), 'MMM d, yyyy h:mm a')}</p>
                      {customer.updated_at && (
                        <p>Last Updated: {format(new Date(customer.updated_at), 'MMM d, yyyy h:mm a')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-secondary/10 flex flex-wrap gap-4 justify-end">
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