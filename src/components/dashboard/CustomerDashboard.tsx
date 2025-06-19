"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";
import { Calendar, Clock, BadgeCheck, AlertTriangle, X, User as UserIcon, Pencil, Phone, ChevronLeft, ChevronRight, CalendarOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { getUserBookings, type SupabaseBooking } from "@/lib/supabase-bookings";
import { useSession } from "next-auth/react";
import { AppointmentCalendar } from "@/components/appointment/AppointmentCalendar";
import { PendingAppointments } from "@/components/dashboard/PendingAppointments";
import { Footer } from "@/components/ui/footer";
import { type Appointment } from "@/lib/appointments";
import { getUserProfile, type UserProfile } from "@/lib/auth";
import { PageLoader } from "@/components/ui/page-loader";
import { parseDateFromDB, formatDateForDisplay, getTodayForDB, isSameDay } from "@/lib/date-utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { getTimeOffPeriods, type TimeOff } from "@/lib/supabase-timeoff";
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

// Helper function to parse time strings for sorting (e.g., "9:00 AM" -> 540 minutes)
const parseTimeToMinutes = (timeStr: string): number => {
  const [hourMin, period] = timeStr.split(' ');
  const [hour, minute] = hourMin.split(':').map(Number);
  let hours = hour;
  if (period === 'PM' && hour < 12) hours += 12;
  if (period === 'AM' && hour === 12) hours = 0;
  return hours * 60 + minute;
};

// Helper function to sort bookings by date and time (ascending)
const sortBookingsByDateTime = (bookings: SupabaseBooking[]): SupabaseBooking[] => {
  return [...bookings].sort((a, b) => {
    // First sort by date
    const dateA = parseDateFromDB(a.appointment_date);
    const dateB = parseDateFromDB(b.appointment_date);
    const dateDiff = dateA.getTime() - dateB.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    // If dates are the same, sort by time
    const timeA = parseTimeToMinutes(a.appointment_time);
    const timeB = parseTimeToMinutes(b.appointment_time);
    return timeA - timeB;
  });
};

interface CustomerDashboardProps {
  userId?: string;
}

export default function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<SupabaseBooking[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOff[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingCounts, setBookingCounts] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  
  // Time-off viewing state (customers can view but not delete)
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOff | null>(null);

  // Weekly view state
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Tab order for swipe navigation
  const tabOrder = ["overview", "appointments", "profile", "history"];
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  
  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setSlideDirection('left');
        setIsAnimating(true);
        setTimeout(() => {
          setActiveTab(tabOrder[currentIndex + 1]);
          setTimeout(() => {
            setIsAnimating(false);
            setSlideDirection(null);
          }, 50);
        }, 150);
      }
    },
    onSwipeRight: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        setSlideDirection('right');
        setIsAnimating(true);
        setTimeout(() => {
          setActiveTab(tabOrder[currentIndex - 1]);
          setTimeout(() => {
            setIsAnimating(false);
            setSlideDirection(null);
          }, 50);
        }, 150);
      }
    },
    threshold: 50,
    preventDefaultTouchmove: true
  });

  // Group bookings by status and date
  const today = new Date();
  const todayForDB = getTodayForDB();
  
  // Filter out cancelled and completed bookings for overview and appointments tabs
  const activeBookings = bookings.filter(booking => 
    booking.status !== 'cancelled' && booking.status !== 'completed'
  );
  
  const upcomingBookings = activeBookings.filter(booking => 
    (booking.status === 'confirmed' || booking.status === 'pending') && 
    (parseDateFromDB(booking.appointment_date) >= today || isSameDay(booking.appointment_date, todayForDB))
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    booking.status === 'cancelled' || 
    (booking.status === 'confirmed' && parseDateFromDB(booking.appointment_date) < today && !isSameDay(booking.appointment_date, todayForDB))
  );

  // Get week days for the weekly view
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group bookings by day for the weekly view (use activeBookings to exclude cancelled)
  const getBookingsForDay = (date: Date) => {
    return activeBookings.filter(booking => {
      // Use standardized date parsing and comparison
      return isSameDay(booking.appointment_date, date) && 
             (booking.status === 'confirmed' || booking.status === 'pending');
    }).sort((a, b) => {
      // Sort by time using the same utility function
      const timeA = parseTimeToMinutes(a.appointment_time);
      const timeB = parseTimeToMinutes(b.appointment_time);
      return timeA - timeB;
    });
  };

  // Get time off for a specific day
  const getTimeOffForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeOffPeriods.filter(timeOff => 
      dateStr >= timeOff.start_date && dateStr <= timeOff.end_date
    );
  };

  // Function to load user profile data
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Load time off periods
  const loadTimeOffPeriods = useCallback(async () => {
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const fromDate = format(subWeeks(weekStart, 2), 'yyyy-MM-dd');
      const toDate = format(addWeeks(weekEnd, 2), 'yyyy-MM-dd');
      const timeOff = await getTimeOffPeriods(fromDate, toDate);
      setTimeOffPeriods(timeOff);
    } catch (error) {
      console.error('Error loading time off periods:', error);
    }
  }, [currentWeek]);

  // Reload time off when week changes
  useEffect(() => {
    loadTimeOffPeriods();
  }, [loadTimeOffPeriods]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Ensure we have a user ID either from props or session
        const authenticatedUserId = userId || session?.user?.id;
        
        if (!authenticatedUserId) {
          console.error("No authenticated user ID available");
          return;
        }
        
        // Fetch user profile data from Supabase
        await loadUserProfile(authenticatedUserId);
        
        // Fetch user bookings
        const userBookings = await getUserBookings(authenticatedUserId);
        
        // Automatically mark past confirmed appointments as completed (frontend only for display)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const processedBookings = userBookings.map(booking => {
          // If booking is confirmed and the appointment date has passed, mark as completed for display
          if (booking.status === 'confirmed' && booking.appointment_date < todayStr) {
            return { ...booking, status: 'completed' as const };
          }
          return booking;
        });
        
        setBookings(processedBookings);
        
        // Get booking counts based on the processed bookings
        const counts = {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0
        };
        
        processedBookings.forEach(booking => {
          if (counts.hasOwnProperty(booking.status)) {
            counts[booking.status as keyof typeof counts]++;
          }
        });
        
        setBookingCounts(counts);
        
        // Convert bookings to appointments format for components that need it
        const appointmentsData: Appointment[] = processedBookings.map(booking => ({
          id: booking.id,
          serviceId: booking.service_id,
          serviceName: booking.service_name,
          date: parseDateFromDB(booking.appointment_date),
          time: booking.appointment_time,
          price: booking.amount_paid,
          status: booking.status,
          userId: booking.user_id,
          providerName: "Service Provider",
          location: "Service Location",
          duration: "60 min",
          bookingDate: new Date(booking.created_at),
          category: "service"
        }));
        
        setAppointments(appointmentsData);
        
        // Load time off periods for calendar display (initial load)
        await loadTimeOffPeriods();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading your dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [userId, session]);

  // Add this effect to refresh user profile when component receives focus 
  // (such as when navigating back from profile edit)
  useEffect(() => {
    // Check if we have the user ID and if page is currently active
    if (pathname === '/' && session?.user?.id) {
      // Refresh user profile data
      loadUserProfile(session.user.id);
    }
  }, [pathname, session?.user?.id]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Call API to cancel booking
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // Update the local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      // Update appointments state
      setAppointments(appointments.map(appointment => 
        appointment.id === bookingId
          ? { ...appointment, status: 'cancelled' } 
          : appointment
      ));
      
      // Update booking counts
      setBookingCounts({
        ...bookingCounts,
        confirmed: Math.max(0, bookingCounts.confirmed - 1),
        cancelled: bookingCounts.cancelled + 1
      });
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "There was an error cancelling this booking",
        variant: "destructive",
      });
    }
  };

  // Handler for when a pending appointment is removed
  const handleAppointmentDeleted = (appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    setBookings(prev => prev.filter(booking => booking.id !== appointmentId));
    setBookingCounts(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1)
    }));
  };

  // Function to handle appointment selection from calendar
  const handleSelectAppointment = (appointment: Appointment) => {
    router.push(`/appointments/${appointment.id}`);
  };

  // Weekly navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Handle time off click (view only for customers)
  const handleTimeOffClick = (timeOff: TimeOff) => {
    setSelectedTimeOff(timeOff);
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Your Dashboard" 
        subMessage="Fetching your appointments and profile information..." 
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-1/4 w-60 h-60 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Welcome Section with User Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {userProfile?.name || session?.user?.name || 'User'}</h1>
              <p className="text-white/80 mt-1">
                You have {upcomingBookings.length} upcoming {upcomingBookings.length === 1 ? 'booking' : 'bookings'}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/services')}
              className="bg-white text-primary hover:bg-white/90 shadow-sm"
            >
              Browse Services
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full z-10 relative">
            <TabsList className="grid w-full max-w-2xl mx-auto bg-white/20 backdrop-blur-sm grid-cols-4 gap-1 p-1 rounded-lg h-12">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">Appointments</span>
                <span className="sm:hidden">Book</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">My Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                History
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div 
              className={`mt-8 relative select-none transition-all duration-300 ease-out ${
                isAnimating 
                  ? slideDirection === 'left' 
                    ? 'transform -translate-x-full opacity-0' 
                    : 'transform translate-x-full opacity-0'
                  : 'transform translate-x-0 opacity-100'
              }`}
              {...swipeHandlers}
              style={{ 
                touchAction: 'pan-y',
                cursor: 'grab'
              }}
            >
              {/* Swipe indicator */}
              <div className="flex justify-center mb-4 space-x-2">
                {tabOrder.map((tab) => (
                  <div
                    key={tab}
                    className={`h-1 w-8 rounded-full transition-colors duration-200 ${
                      tab === activeTab ? 'bg-white/60' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              
              {/* Swipe hint text */}
              <div className="text-center mb-4">
                <p className="text-white/50 text-xs">
                  <span className="hidden sm:inline">Click tabs above or </span>swipe/drag left/right to navigate
                </p>
              </div>
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Display pending appointments that need payment at the top */}
                  <div>
                    <PendingAppointments 
                      appointments={appointments} 
                      onAppointmentDeleted={handleAppointmentDeleted} 
                    />
                  </div>

                  {/* Appointment Stats */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                    <CardHeader className="bg-primary/5 border-b">
                      <CardTitle>Booking Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-lg bg-secondary/10">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                            <p className="text-muted-foreground text-xs sm:text-sm">Pending</p>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-yellow-100 flex items-center justify-center self-end sm:self-auto">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                            </div>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold">{bookingCounts.pending}</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 rounded-lg bg-secondary/10">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                            <p className="text-muted-foreground text-xs sm:text-sm">Confirmed</p>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center self-end sm:self-auto">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </div>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold">{bookingCounts.confirmed}</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 rounded-lg bg-secondary/10">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                            <p className="text-muted-foreground text-xs sm:text-sm">Completed</p>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 flex items-center justify-center self-end sm:self-auto">
                              <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            </div>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold">{bookingCounts.completed}</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 rounded-lg bg-secondary/10">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                            <p className="text-muted-foreground text-xs sm:text-sm">Cancelled</p>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-red-100 flex items-center justify-center self-end sm:self-auto">
                              <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            </div>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold">{bookingCounts.cancelled}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Bookings */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Your Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {activeBookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(activeBookings).slice(0, 5).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4 self-center sm:self-auto">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 sm:items-center">
                              <Badge className={`self-center sm:self-auto ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <div className="flex gap-2 justify-center sm:justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white flex-1 sm:flex-none min-w-0"
                                  onClick={() => router.push(`/appointments/${booking.id}`)}
                                >
                                  Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive flex-1 sm:flex-none min-w-0"
                                      >
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this booking for {booking.service_name}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                        >
                                          Yes, Cancel Booking
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-4">You haven&apos;t made any bookings yet.</p>
                        <Button onClick={() => router.push('/services')}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Appointment Calendar */}
                <div>
                  <AppointmentCalendar 
                    appointments={appointments} 
                    timeOffPeriods={timeOffPeriods}
                    onSelectEvent={handleSelectAppointment}
                  />
                </div>
                
                {/* User Profile Summary Card */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <Avatar className="h-16 w-16 shrink-0">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-xl bg-primary text-white">
                          {(userProfile?.name || session?.user?.name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <CardTitle className="truncate">{userProfile?.name || session?.user?.name || "User"}</CardTitle>
                        <CardDescription className="truncate">{userProfile?.email || session?.user?.email || ""}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-center sm:justify-start">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Member</span>
                    </div>
                    {userProfile?.phone && (
                      <div className="flex items-center justify-center sm:justify-start">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{userProfile.phone}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center p-4 bg-secondary/10">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white"
                      onClick={() => router.push('/profile')}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                {/* Weekly View */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Weekly Appointments</CardTitle>
                        <CardDescription>
                          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousWeek}
                          className="bg-white"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToCurrentWeek}
                          className="bg-white"
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextWeek}
                          className="bg-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent 
                    className="p-0"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    style={{ touchAction: 'auto' }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            {weekDays.map((day) => (
                              <th key={day.toISOString()} className="p-4 text-left font-medium">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">
                                    {format(day, 'EEE')}
                                  </span>
                                  <span className={`text-lg ${
                                    isSameDay(day, today) ? 'text-primary font-bold' : ''
                                  }`}>
                                    {format(day, 'd')}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {weekDays.map((day) => {
                              const dayBookings = getBookingsForDay(day);
                              const timeOffForDay = getTimeOffForDay(day);
                              return (
                                <td key={day.toISOString()} className="p-2 align-top border-r last:border-r-0 min-h-[200px]">
                                  <div className="space-y-2">
                                    {/* Time off periods */}
                                    {timeOffForDay.map((timeOff) => (
                                      <div
                                        key={timeOff.id}
                                        className="p-2 rounded-md bg-red-50 border border-red-200 text-red-800 cursor-pointer hover:bg-red-100 transition-colors"
                                        onClick={() => handleTimeOffClick(timeOff)}
                                        title="Click to view time off details"
                                      >
                                        <div className="text-xs font-medium truncate">
                                          {timeOff.title}
                                        </div>
                                        <div className="text-xs">
                                          {timeOff.is_all_day ? 'All day' : 
                                            `${timeOff.start_time?.substring(0, 5)} - ${timeOff.end_time?.substring(0, 5)}`
                                          }
                                        </div>
                                        <Badge className="text-xs bg-red-100 text-red-700 mt-1">
                                          {timeOff.type.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    ))}
                                    
                                    {/* Bookings */}
                                    {dayBookings.length === 0 && timeOffForDay.length === 0 ? (
                                      <div className="text-center text-muted-foreground text-sm py-4">
                                        No appointments
                                      </div>
                                    ) : (
                                      dayBookings.map((booking) => (
                                        <div
                                          key={booking.id}
                                          className="p-2 rounded-md border bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                          onClick={() => router.push(`/appointments/${booking.id}`)}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-primary">
                                              {booking.appointment_time}
                                            </span>
                                            <Badge 
                                              className={`text-xs ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                              }`}
                                            >
                                              {booking.status}
                                            </Badge>
                                          </div>
                                          <div className="text-sm font-medium truncate mb-1">
                                            {booking.service_name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ${booking.amount_paid}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* All Bookings Section */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Your upcoming and past appointments</CardDescription>
                  </CardHeader>
                  <CardContent 
                    className="p-0"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    style={{ touchAction: 'auto' }}
                  >
                    {activeBookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(activeBookings).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white"
                                  onClick={() => router.push(`/appointments/${booking.id}`)}
                                >
                                  Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive flex-1 sm:flex-none"
                                      >
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this booking for {booking.service_name}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                        >
                                          Yes, Cancel Booking
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-4">You haven&apos;t made any bookings yet.</p>
                        <Button onClick={() => router.push('/services')}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {(userProfile?.name || session?.user?.name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{userProfile?.name || session?.user?.name || "User"}</h3>
                        <p className="text-muted-foreground">{userProfile?.email || session?.user?.email || ""}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
                        <p>Email: {userProfile?.email || session?.user?.email || "Not provided"}</p>
                        {userProfile?.phone && <p>Phone: {userProfile.phone}</p>}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Security Settings</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Password</h4>
                            <p className="text-sm text-muted-foreground">Change your account password</p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => router.push('/auth/change-password')}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 bg-secondary/10">
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/profile')}
                    >
                      Edit Profile
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>Past and cancelled bookings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pastBookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(pastBookings).map((booking) => (
                          <div key={booking.id} className="p-4 flex items-center">
                            <div className="mr-4">
                              {booking.status === 'completed' ? (
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <BadgeCheck className="h-5 w-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <X className="h-5 w-5 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(booking.appointment_date, 'MMM d, yyyy')} • {booking.appointment_time}
                              </div>
                            </div>
                            <Badge className={
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No booking history</h3>
                        <p className="text-muted-foreground mb-4">You don&apos;t have any completed or cancelled bookings yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Appointment Calendar for other tabs */}
          {activeTab !== 'overview' && (
            <div className="mt-8">
              <AppointmentCalendar 
                appointments={appointments} 
                timeOffPeriods={timeOffPeriods}
                onSelectEvent={handleSelectAppointment}
                onSelectTimeOff={handleTimeOffClick}
              />
            </div>
          )}

          {/* Time Off Viewing Dialog (customers can view but not delete) */}
          {selectedTimeOff && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/50" onClick={() => {
                setSelectedTimeOff(null);
              }} />
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarOff className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Service Unavailable</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{selectedTimeOff.title}</p>
                  </div>
                  
                  {selectedTimeOff.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Details</p>
                      <p className="text-sm">{selectedTimeOff.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm">
                      {selectedTimeOff.start_date === selectedTimeOff.end_date ? (
                        format(new Date(selectedTimeOff.start_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')
                      ) : (
                        `${format(new Date(selectedTimeOff.start_date + 'T00:00:00'), 'MMM d')} - ${format(new Date(selectedTimeOff.end_date + 'T00:00:00'), 'MMM d, yyyy')}`
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-sm">
                      {selectedTimeOff.is_all_day ? 'All day' : 
                        selectedTimeOff.start_time && selectedTimeOff.end_time ? 
                          `${selectedTimeOff.start_time.substring(0, 5)} - ${selectedTimeOff.end_time.substring(0, 5)}` : 
                          'All day'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => {
                      setSelectedTimeOff(null);
                    }}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 