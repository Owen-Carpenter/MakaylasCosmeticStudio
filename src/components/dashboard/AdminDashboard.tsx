"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, BadgeCheck, 
  AlertTriangle, X, User as UserIcon,
  Search, ChevronLeft, ChevronRight, Mail, Phone, CalendarOff
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/ui/footer";
import { SupabaseBooking } from "@/lib/supabase-bookings";
import { AppointmentCalendar } from "@/components/appointment/AppointmentCalendar";
import { type Appointment } from "@/lib/appointments";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailDialog } from "@/components/admin/EmailDialog";
import { TimeOffDialog } from "@/components/admin/TimeOffDialog";
import { TimeOffManagementDialog } from "@/components/admin/TimeOffManagementDialog";
import { PageLoader } from "@/components/ui/page-loader";
import { parseDateFromDB, isSameDay as isSameDayUtil } from "@/lib/date-utils";
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

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

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

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<SupabaseBooking[]>([]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingCounts, setBookingCounts] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOff[]>([]);
  
  // Time-off management state
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOff | null>(null);
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  
  // Weekly view state
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Tab order for swipe navigation
  const tabOrder = ["overview", "appointments", "profile", "customers", "history"];
  
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
  
  // Filter out cancelled and completed bookings for overview and bookings tabs
  const activeBookings = bookings.filter(booking => 
    booking.status !== 'cancelled' && booking.status !== 'completed'
  );
  
  const upcomingBookings = activeBookings.filter(booking => 
    (booking.status === 'confirmed' || booking.status === 'pending') && 
    parseDateFromDB(booking.appointment_date) >= today
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    booking.status === 'cancelled' || 
    (booking.status === 'confirmed' && parseDateFromDB(booking.appointment_date) < today)
  );

  // Get week days for the weekly view
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group bookings by day for the weekly view
  const getBookingsForDay = (date: Date) => {
    return activeBookings.filter(booking => {
      // Use standardized date parsing and comparison
      return isSameDayUtil(booking.appointment_date, date) && 
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

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Fetch all bookings via API route for better consistency across environments
        const response = await fetch('/api/bookings/all');
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch bookings');
        }
        
        const allBookings = result.bookings || [];
        
        // Automatically mark past confirmed appointments as completed (frontend only for display)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const processedBookings = allBookings.map((booking: SupabaseBooking) => {
          // If booking is confirmed and the appointment date has passed, mark as completed for display
          if (booking.status === 'confirmed' && booking.appointment_date < todayStr) {
            return { ...booking, status: 'completed' as const };
          }
          return booking;
        });
        
        setBookings(processedBookings);
        
        // Count bookings by status based on processed bookings
        const counts = {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0
        };
        
        processedBookings.forEach((booking: SupabaseBooking) => {
          if (counts.hasOwnProperty(booking.status)) {
            counts[booking.status as keyof typeof counts]++;
          }
        });
        
        setBookingCounts(counts);
        
        // Convert bookings to appointments format for the calendar
        const appointmentsData: Appointment[] = processedBookings.map((booking: SupabaseBooking) => {
          // Determine service category based on service name
          const getServiceCategory = (serviceName: string): string => {
            const name = serviceName.toLowerCase();
            
            // Lash services
            if (name.includes('lash') || name.includes('extension') || name.includes('eyelash')) {
              return 'Lash Services';
            }
            
            // Brow services
            if (name.includes('brow') || name.includes('eyebrow') || name.includes('microblading') || name.includes('tinting')) {
              return 'Brow Services';
            }
            
            // Facial services
            if (name.includes('facial') || name.includes('skincare') || name.includes('hydrafacial') || name.includes('chemical peel')) {
              return 'Facial Services';
            }
            
            // Makeup services
            if (name.includes('makeup') || name.includes('glam') || name.includes('application')) {
              return 'Makeup Services';
            }
            
            // Waxing services
            if (name.includes('wax') || name.includes('hair removal')) {
              return 'Waxing Services';
            }
            
            // Default category
            return 'Beauty Services';
          };

          return {
            id: booking.id,
            serviceId: booking.service_id,
            serviceName: booking.service_name,
            date: parseDateFromDB(booking.appointment_date), // Use standardized date parsing
            time: booking.appointment_time,
            price: booking.amount_paid,
            status: booking.status,
            userId: booking.user_id,
            providerName: "Makayla Singleton",
            location: "Makayla's Cosmetic Studio\n278 U.S. 65 Suite C\nConway, AR 72032",
            duration: "60 min",
            bookingDate: new Date(booking.created_at),
            category: getServiceCategory(booking.service_name)
          };
        });
        
        setAppointments(appointmentsData);
        
        // Load time off periods
        await loadTimeOffPeriods();
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading the dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Reload time off when week changes
  useEffect(() => {
    loadTimeOffPeriods();
  }, [loadTimeOffPeriods]);

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
      
      // Update booking counts
      setBookingCounts({
        ...bookingCounts,
        confirmed: Math.max(0, bookingCounts.confirmed - 1),
        cancelled: bookingCounts.cancelled + 1
      });
      
      toast({
        title: "Booking cancelled",
        description: "The booking has been successfully cancelled",
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

  const handleDeletePendingBooking = async (bookingId: string) => {
    try {
      // Call API to delete pending booking
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
      
      // Remove from local state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
      // Update booking counts
      setBookingCounts({
        ...bookingCounts,
        pending: Math.max(0, bookingCounts.pending - 1)
      });
      
      toast({
        title: "Booking deleted",
        description: "The pending booking has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error deleting this booking",
        variant: "destructive",
      });
    }
  };

  // Function to handle appointment selection from calendar
  const handleSelectAppointment = (appointment: Appointment) => {
    router.push(`/admin/bookings/${appointment.id}`);
  };

  // Handle time off creation
  const handleTimeOffCreated = (timeOff: TimeOff) => {
    setTimeOffPeriods(prev => [...prev, timeOff]);
    toast({
      title: "Time Off Added",
      description: "The time off period has been added to the calendar.",
    });
  };

  // Handle time off deletion
  const handleTimeOffDeleted = (timeOffId: string) => {
    setTimeOffPeriods(prev => prev.filter(timeOff => timeOff.id !== timeOffId));
    toast({
      title: "Time Off Deleted",
      description: "The time off period has been removed from the calendar.",
    });
  };

  // Handle time off click
  const handleTimeOffClick = (timeOff: TimeOff) => {
    setSelectedTimeOff(timeOff);
    setIsTimeOffDialogOpen(true);
  };

  // Function to fetch users/customers
  const fetchCustomers = async (page: number = 1, search: string = '') => {
    try {
      setCustomersLoading(true);
      setCustomersError(null);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      params.append('excludeAdmins', 'true');
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.users);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        setCustomersError(data.message || 'Error loading customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomersError('Failed to load customer data. Please try again.');
    } finally {
      setCustomersLoading(false);
    }
  };
  
  // Load customers when tab changes to customers
  useEffect(() => {
    if (activeTab === 'customers' && !customersLoading && customers.length === 0) {
      fetchCustomers();
    }
  }, [activeTab]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(1, searchQuery);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchCustomers(page, searchQuery);
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

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Admin Dashboard" 
        subMessage="Please wait while we fetch the latest data..." 
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow gradient-bg pt-24 pb-12 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-1/4 w-60 h-60 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Welcome Section with Admin Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/80 mt-1">
                There are {upcomingBookings.length} upcoming bookings
              </p>
            </div>
            <div className="flex gap-2">
              <TimeOffDialog onTimeOffCreated={handleTimeOffCreated} />
              <Button 
                onClick={() => router.push('/services')}
                className="bg-white text-primary hover:bg-white/90 shadow-sm"
              >
                Manage Services
              </Button>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full z-10 relative">
            <TabsList className="grid w-full max-w-3xl mx-auto bg-white/20 backdrop-blur-sm grid-cols-5 gap-1 p-1 rounded-lg h-12">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">Bookings</span>
                <span className="sm:hidden">Book</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                Profile
              </TabsTrigger>
              <TabsTrigger value="customers" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-sm px-3 rounded-md transition-all duration-200 flex items-center justify-center h-full">
                <span className="hidden sm:inline">Customers</span>
                <span className="sm:hidden">Users</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Admin Profile Card */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                    <CardHeader className="bg-primary/5 border-b flex flex-row items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={session?.user.image || ""} />
                        <AvatarFallback className="text-xl bg-primary text-white">
                          {session?.user.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{session?.user.name || "Admin"}</CardTitle>
                        <CardDescription>Administrator</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Admin Account</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{session?.user.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Booking Stats Card */}
                  <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0 col-span-2">
                    <CardHeader className="bg-primary/5 border-b">
                      <CardTitle>Booking Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Pending</p>
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.pending}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Confirmed</p>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.confirmed}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Completed</p>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <BadgeCheck className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.completed}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Cancelled</p>
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <X className="h-4 w-4 text-red-600" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{bookingCounts.cancelled}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                                 
                 {/* Recent Bookings */}
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest 5 bookings across all users</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {activeBookings.length > 0 ? (
                      <div className="divide-y">
                        {sortBookingsByDateTime(activeBookings).slice(0, 5).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:mr-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(parseDateFromDB(booking.appointment_date), 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="flex flex-wrap gap-x-4 mt-1">
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <UserIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span className="font-medium">{booking.customer_name || 'Customer'}</span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span>{booking.customer_email || 'No email'}</span>
                                </div>
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
                              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white min-w-0 flex-shrink-0"
                                  onClick={() => {
                                    console.log("Navigating to booking details for ID:", booking.id);
                                    router.push(`/admin/bookings/${booking.id}`);
                                  }}
                                >
                                  Details
                                </Button>
                                {booking.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive min-w-0 flex-shrink-0"
                                    onClick={() => handleDeletePendingBooking(booking.id)}
                                  >
                                    Delete
                                  </Button>
                                )}
                                {booking.customer_email && (
                                  <EmailDialog 
                                    customerEmail={booking.customer_email}
                                    customerName={booking.customer_name || 'Customer'}
                                  />
                                )}
                                {booking.status === 'confirmed' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white hover:bg-blue-50 hover:text-blue-600 border-blue-200 text-blue-600 min-w-0 flex-shrink-0"
                                      onClick={() => router.push(`/admin/bookings/${booking.id}/reschedule`)}
                                    >
                                      Reschedule
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive min-w-0 flex-shrink-0"
                                        >
                                          Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to cancel this booking for {booking.customer_name || 'Customer'}? This action cannot be undone and the customer will be notified.
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
                                  </>
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
                        <p className="text-muted-foreground mb-4">There are no bookings in the system yet.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 bg-secondary/10">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white"
                      onClick={() => setActiveTab("appointments")}
                    >
                      View All Bookings
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
                        <TimeOffDialog
                          onTimeOffCreated={handleTimeOffCreated}
                          trigger={
                            <Button variant="outline" size="sm" className="bg-white">
                              <CalendarOff className="h-4 w-4 mr-2" />
                              Add Time Off
                            </Button>
                          }
                        />
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
                                    isSameDayUtil(day, today) ? 'text-primary font-bold' : ''
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
                              const dayTimeOff = getTimeOffForDay(day);
                              return (
                                <td key={day.toISOString()} className="p-2 align-top border-r last:border-r-0 min-h-[200px]">
                                  <div className="space-y-2">
                                    {/* Time off periods */}
                                    {dayTimeOff.map((timeOff) => (
                                      <div
                                        key={timeOff.id}
                                        className="p-2 rounded-md bg-red-50 border border-red-200 text-red-800 cursor-pointer hover:bg-red-100 transition-colors"
                                        onClick={() => handleTimeOffClick(timeOff)}
                                        title="Click to manage this time off period"
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
                                    {dayBookings.length === 0 && dayTimeOff.length === 0 ? (
                                      <div className="text-center text-muted-foreground text-sm py-4">
                                        No appointments
                                      </div>
                                    ) : (
                                      dayBookings.map((booking) => (
                                        <div
                                          key={booking.id}
                                          className="p-2 rounded-md border bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
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
                                          <div className="text-xs text-muted-foreground truncate">
                                            {booking.customer_name || 'Customer'}
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
                    <CardDescription>Manage all customer bookings</CardDescription>
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
                                {format(parseDateFromDB(booking.appointment_date), 'EEEE, MMMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="flex flex-wrap gap-x-4 mt-1">
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <UserIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span className="font-medium">{booking.customer_name || 'Customer'}</span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span>{booking.customer_email || 'No email'}</span>
                                </div>
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
                              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white min-w-0 flex-shrink-0"
                                  onClick={() => {
                                    console.log("Navigating to booking details for ID (from all bookings view):", booking.id);
                                    router.push(`/admin/bookings/${booking.id}`);
                                  }}
                                >
                                  Details
                                </Button>
                                {booking.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive min-w-0 flex-shrink-0"
                                    onClick={() => handleDeletePendingBooking(booking.id)}
                                  >
                                    Delete
                                  </Button>
                                )}
                                {booking.customer_email && (
                                  <EmailDialog 
                                    customerEmail={booking.customer_email}
                                    customerName={booking.customer_name || 'Customer'}
                                  />
                                )}
                                {booking.status === 'confirmed' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white hover:bg-blue-50 hover:text-blue-600 border-blue-200 text-blue-600 min-w-0 flex-shrink-0"
                                      onClick={() => router.push(`/admin/bookings/${booking.id}/reschedule`)}
                                    >
                                      Reschedule
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-white hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-destructive min-w-0 flex-shrink-0"
                                        >
                                          Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to cancel this booking for {booking.customer_name || 'Customer'}? This action cannot be undone and the customer will be notified.
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
                                  </>
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
                        <p className="text-muted-foreground mb-4">There are no bookings in the system yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Customer Management</CardTitle>
                        <CardDescription>View and manage customer accounts</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {showSearch ? (
                          <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <Input
                              placeholder="Search by name or email"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full max-w-xs"
                            />
                            <Button type="submit" size="sm" className="shrink-0">
                              <Search className="h-4 w-4 mr-2" />
                              Search
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setShowSearch(false);
                                setSearchQuery('');
                                if (searchQuery) fetchCustomers(1, '');
                              }}
                            >
                              Cancel
                            </Button>
                          </form>
                        ) : (
                          <Button onClick={() => setShowSearch(true)} variant="outline" size="sm">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </Button>
                        )}
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
                    {customersLoading ? (
                      <div className="space-y-4 p-6">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : customersError ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                        <h3 className="text-lg font-medium">Error Loading Customers</h3>
                        <p className="text-muted-foreground mt-2 mb-4">{customersError}</p>
                        <Button onClick={() => fetchCustomers()}>Try Again</Button>
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Customers Found</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                          {searchQuery 
                            ? "No results match your search criteria." 
                            : "There are no customer accounts in the system yet."}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchQuery('');
                              fetchCustomers(1, '');
                            }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {customers.map((customer) => (
                          <div key={customer.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="md:mr-4 shrink-0">
                              <Avatar className="h-14 w-14 border">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {customer.name?.charAt(0) || customer.email?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-lg truncate">{customer.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                  <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  {customer.phone}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                Member since: {new Date(customer.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 md:items-center mt-2 md:mt-0">
                              <Badge className="bg-blue-100 text-blue-800">
                                Customer
                              </Badge>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white"
                                  onClick={() => router.push(`/admin/customers/${customer.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white"
                                  onClick={() => router.push(`/admin/customers/${customer.id}/bookings`)}
                                >
                                  Bookings
                                </Button>
                                <EmailDialog 
                                  customerEmail={customer.email}
                                  customerName={customer.name || "Customer"}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center px-4 py-6 gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1 mx-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page === 1 || 
                              page === totalPages || 
                              Math.abs(page - currentPage) < 2
                            )
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-2">...</span>
                                )}
                                
                                <Button 
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="h-8 w-8 p-0"
                                  aria-label={`Page ${page}`}
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            ))
                          }
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {session?.user?.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{session?.user?.name || "Admin"}</h3>
                        <p className="text-muted-foreground">{session?.user?.email || ""}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
                        <p>Email: {session?.user?.email || "Not provided"}</p>
                        <p>Role: Administrator</p>
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
                      Edit Full Profile
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
                      <div className="divide-y max-h-[500px] overflow-y-auto">
                        {sortBookingsByDateTime(pastBookings).map((booking) => (
                          <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="sm:mr-4 self-start sm:self-center">
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
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{booking.service_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(parseDateFromDB(booking.appointment_date), 'MMM d, yyyy')} • {booking.appointment_time}
                              </div>
                              <div className="flex flex-wrap gap-x-4 mt-1">
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <UserIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span className="font-medium">{booking.customer_name || 'Customer'}</span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                                  <span>{booking.customer_email || 'No email'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                              <Badge className={
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              {booking.customer_email && (
                                <EmailDialog 
                                  customerEmail={booking.customer_email}
                                  customerName={booking.customer_name || 'Customer'}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No booking history</h3>
                        <p className="text-muted-foreground mb-4">There are no completed or cancelled bookings yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Appointment Calendar at the bottom */}
          <div className="mt-8">
            <AppointmentCalendar 
              appointments={appointments} 
              timeOffPeriods={timeOffPeriods}
              onSelectEvent={handleSelectAppointment}
              onSelectTimeOff={handleTimeOffClick}
            />
          </div>

          {/* Time Off Management Dialog */}
          {selectedTimeOff && (
            <TimeOffManagementDialog
              timeOff={selectedTimeOff}
              isOpen={isTimeOffDialogOpen}
              onClose={() => {
                setIsTimeOffDialogOpen(false);
                setSelectedTimeOff(null);
              }}
              onTimeOffDeleted={handleTimeOffDeleted}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 