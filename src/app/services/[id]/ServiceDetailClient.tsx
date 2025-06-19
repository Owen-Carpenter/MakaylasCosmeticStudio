"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Service } from "@/lib/services";
import { Clock, ArrowLeft, MapPin, Check, DollarSign, CalendarIcon } from "lucide-react";
import { format, addMonths, parseISO } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { checkTimeOffConflict, getTimeOffForDate, type TimeOff } from "@/lib/supabase-timeoff";

// All possible time slots
const ALL_TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

interface DbBooking {
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
}

interface ServiceDetailClientProps {
  service: Service | null;
}

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("main-office");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(ALL_TIME_SLOTS);
  const [timeSlotDisplay, setTimeSlotDisplay] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [existingBookings, setExistingBookings] = useState<DbBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOff[]>([]);
  
  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Helper function to parse time strings to minutes
  const parseTimeToMinutes = (timeStr: string) => {
    const [hourMin, period] = timeStr.split(' ');
    const [hour, minute] = hourMin.split(':').map(Number);
    let hours = hour;
    if (period === 'PM' && hour < 12) hours += 12;
    if (period === 'AM' && hour === 12) hours = 0;
    return hours * 60 + minute;
  };

  // Check if two time ranges overlap
  const isTimeOverlapping = (time1: string, duration1: number, time2: string, duration2: number) => {
    const time1Start = parseTimeToMinutes(time1);
    const time1End = time1Start + duration1;
    
    const time2Start = parseTimeToMinutes(time2);
    const time2End = time2Start + duration2;
    
    return (time1Start < time2End && time1End > time2Start);
  };

  // Format minutes to time display
  const formatMinutesToTimeDisplay = (minutes: number) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) hours -= 12;
    else if (hours === 0) hours = 12;
    
    return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Check if a time slot conflicts with time off
  const isTimeSlotBlockedByTimeOff = (timeSlot: string, date: Date, durationMinutes: number): { blocked: boolean; reason?: string } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const timeOffForDate = timeOffPeriods.filter(timeOff => 
      dateStr >= timeOff.start_date && dateStr <= timeOff.end_date
    );

    for (const timeOff of timeOffForDate) {
      // If it's all day time off, block the entire day
      if (timeOff.is_all_day) {
        return {
          blocked: true,
          reason: `Unavailable due to ${timeOff.title}`
        };
      }

      // Check time overlap for partial day time off
      if (timeOff.start_time && timeOff.end_time) {
        const timeSlotMinutes = parseTimeToMinutes(timeSlot);
        const timeSlotEndMinutes = timeSlotMinutes + durationMinutes;
        
        const [timeOffStartHour, timeOffStartMin] = timeOff.start_time.split(':').map(Number);
        const [timeOffEndHour, timeOffEndMin] = timeOff.end_time.split(':').map(Number);
        
        const timeOffStartMinutes = timeOffStartHour * 60 + timeOffStartMin;
        const timeOffEndMinutes = timeOffEndHour * 60 + timeOffEndMin;

        // Check if time slot overlaps with time off
        if (!(timeSlotEndMinutes <= timeOffStartMinutes || timeSlotMinutes >= timeOffEndMinutes)) {
          return {
            blocked: true,
            reason: `Conflicts with ${timeOff.title} (${formatMinutesToTimeDisplay(timeOffStartMinutes)} - ${formatMinutesToTimeDisplay(timeOffEndMinutes)})`
          };
        }
      }
    }

    return { blocked: false };
  };

  // Fetch existing bookings and time off when component mounts
  useEffect(() => {
    const fetchExistingBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const response = await fetch('/api/bookings/all');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setExistingBookings(data.bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fall back to using demo data if API fails
        setExistingBookings([
          {
            id: "booking-1746753799783",
            user_id: "521d0a1e-81b7-4df3-9081-e1435c028241",
            service_id: "4a05b5fa-951f-4a05-a3f2-37b3c505eb45",
            service_name: "Electrical Repairs",
            appointment_date: "2025-05-09T05:00:00.000Z",
            appointment_time: "9:00 AM",
            status: "confirmed",
            payment_status: "paid",
            payment_intent: "cs_test_a1IZZSEVLvq7EQ4ZP6c8m56iiHnzG2TRBLxy5ugVsHfP7zGuZIDlUNw1v5",
            amount_paid: 0.00,
            created_at: "2025-05-09 01:23:20.502+00",
            updated_at: "2025-05-09 01:23:33.047565+00"
          },
          {
            id: "booking-1746754920144",
            user_id: "521d0a1e-81b7-4df3-9081-e1435c028241",
            service_id: "495fe372-ba26-4442-b583-6d7d187025a0",
            service_name: "Financial Planning",
            appointment_date: "2025-05-10T05:00:00.000Z",
            appointment_time: "1:00 PM",
            status: "confirmed",
            payment_status: "paid",
            payment_intent: "cs_test_a1JtZrjPyVcM2R8XpoWQU0Ff8FIcepCRFJzYZrPj52pYVKXRGNKpl6ukPy",
            amount_paid: 0.00,
            created_at: "2025-05-09 01:42:00.998+00",
            updated_at: "2025-05-09 01:42:20.495138+00"
          },
          {
            id: "booking-1746755802903",
            user_id: "521d0a1e-81b7-4df3-9081-e1435c028241",
            service_id: "4a05b5fa-951f-4a05-a3f2-37b3c505eb45",
            service_name: "Electrical Repairs",
            appointment_date: "2025-05-11T05:00:00.000Z",
            appointment_time: "11:00 AM", 
            status: "confirmed",
            payment_status: "paid",
            payment_intent: "cs_test_a1sJSLTNUjOf2thluxtioZsTajXMNT1yHjIC3u3lGu6zqelwDTJ02qHttz",
            amount_paid: 0.00,
            created_at: "2025-05-09 01:56:43.59+00",
            updated_at: "2025-05-09 01:56:55.915853+00"
          }
        ]);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    
    fetchExistingBookings();
  }, []);

  // Fetch time off periods when date selection changes
  useEffect(() => {
    const fetchTimeOff = async () => {
      if (!selectedDate) return;
      
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const timeOff = await getTimeOffForDate(dateStr);
        setTimeOffPeriods(timeOff);
      } catch (error) {
        console.error('Error fetching time off:', error);
      }
    };

    fetchTimeOff();
  }, [selectedDate]);

  // Get service duration value in minutes
  const getServiceDurationMinutes = (serviceTime: string): number => {
    const durationMatch = serviceTime.match(/(\d+)/);
    return durationMatch ? parseInt(durationMatch[1], 10) : 60;
  };

  // Get service duration for a specific service ID from existing bookings
  const getServiceDurationByServiceId = (serviceId: string): number => {
    // Find a service in mock data that matches to get its duration
    const mockServices = [
      { id: "4a05b5fa-951f-4a05-a3f2-37b3c505eb45", time: "100 min" }, // Electrical Repairs
      { id: "495fe372-ba26-4442-b583-6d7d187025a0", time: "120 min" }, // Financial Planning
    ];
    
    const mockService = mockServices.find(s => s.id === serviceId);
    if (mockService) {
      return getServiceDurationMinutes(mockService.time);
    }
    
    // Default to 60 minutes if we can't determine service duration
    return 60;
  };

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !service) return;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const serviceDurationMinutes = getServiceDurationMinutes(service.time);
    
    // Get bookings for the selected date (active bookings only)
    const dateBookings = existingBookings.filter(booking => {
      // Parse ISO date and format it to yyyy-MM-dd
      const bookingDate = booking.appointment_date.includes('T') 
        ? format(parseISO(booking.appointment_date), "yyyy-MM-dd")
        : booking.appointment_date;
        
      return bookingDate === formattedDate && 
        (booking.status === 'confirmed' || booking.status === 'pending');
    });
    
    // Create a display object for each time slot
    const timeDisplay: Record<string, { available: boolean; reason?: string }> = {};
    
    // Check each time slot against existing bookings and time off
    const available = ALL_TIME_SLOTS.filter(timeSlot => {
      // First check time off conflicts
      const timeOffCheck = isTimeSlotBlockedByTimeOff(timeSlot, selectedDate, serviceDurationMinutes);
      if (timeOffCheck.blocked) {
        timeDisplay[timeSlot] = {
          available: false,
          reason: timeOffCheck.reason
        };
        return false;
      }

      // Then check booking conflicts
      const overlappingBooking = dateBookings.find(booking => {
        // Get the service duration for this booking's service
        const bookingServiceDuration = getServiceDurationByServiceId(booking.service_id);
        
        return isTimeOverlapping(
          timeSlot, 
          serviceDurationMinutes, 
          booking.appointment_time, 
          bookingServiceDuration
        );
      });
      
      // Store availability and reason
      if (overlappingBooking) {
        const bookingDuration = getServiceDurationByServiceId(overlappingBooking.service_id);
        const bookingTimeStart = parseTimeToMinutes(overlappingBooking.appointment_time);
        const bookingTimeEnd = bookingTimeStart + bookingDuration;
        
        timeDisplay[timeSlot] = {
          available: false,
          reason: `Conflicts with ${overlappingBooking.service_name} from ${overlappingBooking.appointment_time} to ${formatMinutesToTimeDisplay(bookingTimeEnd)}`
        };
        return false;
      } else {
        timeDisplay[timeSlot] = { available: true };
        return true;
      }
    });
    
    setTimeSlotDisplay(timeDisplay);
    setAvailableTimeSlots(available);
    
    // If the currently selected time is no longer available, reset it
    if (selectedTime && !available.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedDate, service, existingBookings, selectedTime, timeOffPeriods]);

  // If service is null, show error state
  if (!service) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Service Not Found</CardTitle>
            <CardDescription>The service you&apos;re looking for doesn&apos;t exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6">
            <Button onClick={handleBack} className="bg-primary hover:bg-primary/90 text-white">
              <ArrowLeft className="mr-2" size={16} />
              Back to Services
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Handle booking with time off validation
  const handleBooking = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    // Double-check for time off conflicts before proceeding
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const serviceDuration = getServiceDurationMinutes(service.time);
    const [hour, minute] = selectedTime.split(/[:\s]/);
    const timeStr = `${hour}:${minute}`;

    try {
      const hasConflict = await checkTimeOffConflict(dateStr, timeStr, serviceDuration);
      
      if (hasConflict) {
        toast.error("This time slot conflicts with scheduled time off. Please select a different time.");
        return;
      }
    } catch (error) {
      console.error("Error checking time off conflict:", error);
      // Continue with booking if time off check fails
    }
    
    // Format date for display
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create booking payload
    const bookingData = {
      serviceId: service.id,
      serviceName: service.title,
      date: selectedDate,
      time: selectedTime,
      price: service.price,
      location: selectedLocation,
      duration: service.time,
      userId: session?.user?.id || 'guest'
    };
    
    try {
      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Booking confirmed for ${formattedDate} at ${selectedTime}`);
        
        // Redirect to checkout or confirmation page (if needed)
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      } else {
        toast.error(result.message || "Something went wrong with your booking");
      }
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process your booking. Please try again.");
    }
  };
  
  // Locations - would come from real data in production
  const locations = [
    { id: "main-office", name: "Main Office - Downtown" },
    { id: "north-branch", name: "North Branch" },
    { id: "south-branch", name: "South Branch" },
  ];
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "all") return "All Services";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <main className="gradient-bg pt-24 pb-20 min-h-screen overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-yellow-400 blur-3xl animate-pulse max-md:w-40 max-md:h-40"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-yellow-400 blur-3xl animate-pulse delay-300 max-md:w-32 max-md:h-32"></div>
      </div>

      <div className="content-container relative z-10">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-8 flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Button>

        <div className="max-w-6xl mx-auto">
          {/* Service Title */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 gradient-text inline-block px-4">{service.title}</h1>
            <div className="flex justify-center items-center">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                {formatCategoryName(service.category)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Service Details */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    About This Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{service.details}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Clock size={18} />
                        <span className="font-medium text-sm md:text-base">Duration</span>
                      </div>
                      <p className="text-sm md:text-base">{service.time}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <DollarSign size={18} />
                        <span className="font-medium text-sm md:text-base">Price</span>
                      </div>
                      <p className="text-lg md:text-xl font-bold">${service.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Professional consultation with our experts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Personalized service tailored to your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Follow-up support after your appointment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Access to premium resources and tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm md:text-base">Makaylas Cosmetic Studio</p>
                      <p className="text-gray-600 text-sm md:text-base">123 Service Lane, Suite 456</p>
                      <p className="text-gray-600 text-sm md:text-base">Business District, NY 10001</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 h-32 rounded-lg mt-4 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Interactive map</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="order-1 lg:order-2">
              <Card className="bg-white/95 backdrop-blur-sm lg:sticky lg:top-24 border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b">
                  <CardTitle className="text-xl md:text-2xl text-center">Book Your Appointment</CardTitle>
                  <CardDescription className="text-center text-sm md:text-base">Select your preferred date and time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Date</label>
                    <div className="border rounded-md overflow-hidden w-full">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setSelectedDate(date);
                            setSelectedTime("");
                          }
                        }}
                        minDate={new Date()}
                        maxDate={addMonths(new Date(), 1)}
                        inline
                        calendarClassName="!border-0 !shadow-none !w-full"
                        dayClassName={(date: Date) => {
                          if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                            return "!bg-primary !text-white rounded-full";
                          }
                          if (date.toDateString() === new Date().toDateString()) {
                            return "!bg-primary/10 !text-primary rounded-full";
                          }
                          return "";
                        }}
                        renderCustomHeader={({
                          date,
                          decreaseMonth,
                          increaseMonth,
                          prevMonthButtonDisabled,
                          nextMonthButtonDisabled
                        }) => (
                          <div className="flex items-center justify-between px-2 py-2">
                            <button
                              onClick={decreaseMonth}
                              disabled={prevMonthButtonDisabled}
                              type="button"
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium">
                              {format(date, "MMMM yyyy")}
                            </span>
                            <button
                              onClick={increaseMonth}
                              disabled={nextMonthButtonDisabled}
                              type="button"
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                          </div>
                        )}
                      />
                    </div>
                    {selectedDate && (
                      <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-center">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Time</label>
                    {isLoadingBookings ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : selectedDate && availableTimeSlots.length === 0 ? (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                        No available time slots for this date. Please select another date.
                      </div>
                    ) : selectedDate ? (
                      <>
                        <Select 
                          onValueChange={(value) => setSelectedTime(value)}
                          disabled={!selectedDate || availableTimeSlots.length === 0}
                          value={selectedTime}
                        >
                          <SelectTrigger className="w-full border rounded-md h-10">
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_TIME_SLOTS.map((time) => {
                              const isAvailable = timeSlotDisplay[time]?.available !== false;
                              return (
                                <SelectItem 
                                  key={time} 
                                  value={time} 
                                  disabled={!isAvailable}
                                  className={`cursor-pointer ${!isAvailable ? 'opacity-50' : ''}`}
                                >
                                  <div className="flex flex-col">
                                    <span>{time}</span>
                                    {!isAvailable && (
                                      <span className="text-xs text-red-500">
                                        {timeSlotDisplay[time]?.reason || 'Unavailable'}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <div className="mt-2 text-xs text-gray-600">
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-primary/20 rounded-full mr-2"></div>
                            <span>Available times</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
                            <span>Times with existing bookings</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Please select a date first</p>
                    )}
                    {selectedDate && selectedTime && (
                      <div className="text-xs text-gray-600 mt-2">
                        <p className="font-medium">Service duration: {service.time}</p>
                        <p>Your appointment will end at approximately {
                          (() => {
                            const startTime = parseTimeToMinutes(selectedTime);
                            const endTime = startTime + parseInt(service.time.split(' ')[0], 10);
                            return formatMinutesToTimeDisplay(endTime);
                          })()
                        }</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Location</label>
                    <Select 
                      value={selectedLocation} 
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full border rounded-md h-10">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id} className="cursor-pointer">
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <CalendarIcon size={16} className="text-primary" />
                        Your Selection
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {' '} at {selectedTime}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 p-6">
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">${service.price.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={handleBooking} 
                      disabled={!selectedDate || !selectedTime}
                      className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium text-lg"
                    >
                      Book Now
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      By booking, you agree to our terms and conditions.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border: none !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__month {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__day {
          margin: 0.1rem !important;
          width: calc((100% - 1.4rem) / 7) !important;
          max-width: 2.5rem !important;
          min-width: 1.8rem !important;
          height: 2rem !important;
          line-height: 2rem !important;
          border-radius: 9999px !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.875rem !important;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
        }
        .react-datepicker__header {
          background: white !important;
          border: none !important;
          padding-top: 0.5rem !important;
        }
        .react-datepicker__day-names {
          margin-top: 0.5rem !important;
          display: flex !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        .react-datepicker__day-name {
          margin: 0.1rem !important;
          width: calc((100% - 1.4rem) / 7) !important;
          max-width: 2.5rem !important;
          min-width: 1.8rem !important;
          height: 2rem !important;
          line-height: 2rem !important;
          color: #6b7280 !important;
          font-size: 0.75rem !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        @media (max-width: 640px) {
          .react-datepicker__day {
            font-size: 0.75rem !important;
            height: 1.75rem !important;
            line-height: 1.75rem !important;
            min-width: 1.5rem !important;
          }
          .react-datepicker__day-name {
            font-size: 0.6rem !important;
            height: 1.75rem !important;
            line-height: 1.75rem !important;
            min-width: 1.5rem !important;
          }
        }
      `}</style>
    </main>
  );
} 