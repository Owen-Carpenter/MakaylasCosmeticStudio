import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/lib/appointments";
import { Calendar, Clock, Home, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PendingAppointmentsProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: string) => void;
}

export function PendingAppointments({ appointments, onAppointmentDeleted }: PendingAppointmentsProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [pendingList, setPendingList] = useState(appointments.filter(app => app.status === 'pending'));
  
  // If no pending appointments, don't render anything
  if (pendingList.length === 0) {
    return null;
  }
  
  const handlePayment = async (appointmentId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [appointmentId]: true }));
      
      const response = await fetch('/api/bookings/get-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: appointmentId }),
      });
      
      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Redirect to the payment URL
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate payment link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting payment link:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };
  
  const handleDelete = async (appointmentId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [appointmentId]: true }));
      
      const response = await fetch('/api/bookings/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: appointmentId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the appointment from the list
        setPendingList(prevList => prevList.filter(app => app.id !== appointmentId));
        
        // Notify parent component if callback exists
        if (onAppointmentDeleted) {
          onAppointmentDeleted(appointmentId);
        }
        
        toast({
          title: "Success",
          description: "Appointment deleted successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your appointment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [appointmentId]: false }));
    }
  };
  
  return (
    <Card className="mb-6 bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-amber-800">
          Pending Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-amber-700 mb-4">
          You have appointments that require payment to be confirmed. Pay now or delete if you no longer need the appointment.
        </div>
        
        <div className="space-y-4">
          {pendingList.map((appointment) => (
            <div key={appointment.id} className="bg-white p-4 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="sm:mr-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-700" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{appointment.serviceName}</div>
                <div className="text-sm text-muted-foreground flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.time}
                </div>
                <div className="text-sm text-muted-foreground flex items-center mt-1">
                  <Home className="h-4 w-4 mr-1" />
                  {appointment.location}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3 sm:mt-0 sm:w-36">
                <Badge className="bg-amber-100 text-amber-800 mb-2">
                  Payment Pending
                </Badge>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="default"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 w-full"
                    onClick={() => handlePayment(appointment.id)}
                    disabled={isLoading[appointment.id] || isDeleting[appointment.id]}
                  >
                    {isLoading[appointment.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                        disabled={isLoading[appointment.id] || isDeleting[appointment.id]}
                      >
                        {isDeleting[appointment.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your appointment. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(appointment.id)} 
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 