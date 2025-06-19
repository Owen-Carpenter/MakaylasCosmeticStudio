"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAppointments, cancelAppointment, type Appointment } from '@/lib/appointments';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, MapPin, DollarSign, User, CalendarDays, ArrowLeft, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageLoader } from "@/components/ui/page-loader";

export default function AppointmentDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const appointmentId = typeof params.id === 'string' ? params.id : '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadAppointment() {
      if (status === "loading") return;
      if (!session || !session.user) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to view appointment details.",
        });
        router.push('/auth/login');
        return;
      }

      try {
        const appointments = await getAppointments(session.user.id);
        const foundAppointment = appointments.find(a => a.id === appointmentId);
        
        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          toast({
            variant: "destructive",
            title: "Appointment Not Found",
            description: "We couldn't find the appointment you're looking for.",
          });
        }
      } catch (error) {
        console.error("Error loading appointment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading appointment details.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAppointment();
  }, [appointmentId, router, session, status]);

  const handleCancelAppointment = async () => {
    if (!appointment || !session?.user?.id) return;
    
    setIsCancelling(true);
    try {
      await cancelAppointment(appointment.id, session.user.id);
      // Refresh appointment data
      const appointments = await getAppointments(session.user.id);
      const updatedAppointment = appointments.find(a => a.id === appointmentId);
      setAppointment(updatedAppointment || null);
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem cancelling your appointment.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Appointment Details" 
        subMessage="Please wait while we fetch your appointment information..." 
      />
    );
  }

  if (!appointment) {
    return (
      <main className="gradient-bg pt-32 pb-20">
        <div className="content-container relative z-10">
          <Button 
            variant="outline" 
            className="mb-6 bg-white"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
            <CardContent className="flex flex-col items-center text-center p-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Appointment Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn&apos;t find the appointment you&apos;re looking for. It may have been removed or the link is incorrect.
              </p>
              <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Determine if appointment is in the past based on date, not just status
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDateOnly = new Date(appointment.date.getFullYear(), appointment.date.getMonth(), appointment.date.getDate());
  const isDateInPast = appointmentDateOnly < today;
  
  const isUpcoming = (appointment.status === 'confirmed' || appointment.status === 'pending') && !isDateInPast;
  const isPast = appointment.status === 'completed' || appointment.status === 'cancelled' || isDateInPast;

  return (
    <main className="gradient-bg pt-32 pb-20">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>
      
      <div className="content-container relative z-10">
        <Button 
          variant="outline" 
          className="mb-6 bg-white"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0 overflow-hidden">
          <div className={`h-2 ${
            appointment.status === 'confirmed' ? 'bg-green-500' :
            appointment.status === 'pending' ? 'bg-amber-500' :
            appointment.status === 'completed' ? 'bg-blue-500' :
            'bg-red-500'
          }`} />
          
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">{appointment.serviceName}</CardTitle>
                <CardDescription className="text-base mt-1">
                  Appointment #{appointment.id.split('-')[0]}
                </CardDescription>
              </div>
              <Badge className={`text-sm py-1 px-2 ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                'bg-red-100 text-red-800 hover:bg-red-100'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Warning for pending appointments */}
            {appointment.status === 'pending' && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-800">Pending Confirmation</AlertTitle>
                <AlertDescription className="text-amber-700">
                  This appointment is waiting for confirmation. You&apos;ll receive notification once it&apos;s confirmed.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Main info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date & Time */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">
                      {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {appointment.time} ({appointment.duration})
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Service Details */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div className="font-medium">
                      {appointment.providerName}
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <div className="text-sm text-muted-foreground">Service Type</div>
                    <div className="font-medium">
                      {appointment.category.charAt(0).toUpperCase() + appointment.category.slice(1)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Location */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="font-medium">
                      {appointment.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Details */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-medium">
                      ${appointment.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <div className="text-sm text-muted-foreground">Booking Date</div>
                    <div className="font-medium flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(appointment.bookingDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          
          <CardFooter className={`border-t p-6 ${isPast ? 'bg-secondary/5' : 'bg-white'}`}>
            {isUpcoming && (
              <div className="w-full flex flex-col sm:flex-row gap-3 sm:justify-between">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push('/dashboard')}
                >
                  Return to Dashboard
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                  {appointment.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                      onClick={() => router.push(`/appointments/${appointment.id}/reschedule`)}
                    >
                      Reschedule
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive"
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Appointment'
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {isPast && (
              <div className="w-full flex justify-between items-center">
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => router.push('/dashboard')}
                >
                  Return to Dashboard
                </Button>
                {appointment.status === 'completed' && (
                  <Button onClick={() => router.push(`/appointments/${appointment.id}/review`)}>
                    Leave a Review
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
} 