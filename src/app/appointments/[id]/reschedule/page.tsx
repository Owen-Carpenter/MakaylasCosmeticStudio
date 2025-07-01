'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Appointment, updateAppointmentDateTime, getAppointmentById } from '@/lib/appointments';
import { ArrowLeft, CalendarIcon, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { PageLoader } from "@/components/ui/page-loader";
import { formatDateForDB, isSameDay as isSameDayUtil } from '@/lib/date-utils';
import { getTimeOffPeriods, TimeOff } from '@/lib/supabase-timeoff';
import { 
  generateTimeSlotsForDate, 
  isBusinessOpenOnDate, 
  validateAppointmentTime,
  getBusinessHoursForDate,
  getDayName 
} from '@/lib/business-hours';

// Define the booking type to avoid 'any'
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

// We'll replace this with real data from the API
// const MOCK_BOOKINGS = [
//   { id: "booking1", date: "2025-05-08", time: "9:00 AM", duration: "60 min" },
//   { id: "booking2", date: "2025-05-08", time: "11:00 AM", duration: "90 min" },
//   { id: "booking3", date: "2025-05-09", time: "2:00 PM", duration: "60 min" },
// ];

export default function RescheduleAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const appointmentId = params.id as string;
  const userId = session?.user?.id;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allTimeSlotsForDate, setAllTimeSlotsForDate] = useState<string[]>([]);
  const [timeSlotDisplay, setTimeSlotDisplay] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [existingBookings, setExistingBookings] = useState<DbBooking[]>([]);
  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOff[]>([]);

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

  // Fetch all bookings when component mounts
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const response = await fetch('/api/bookings/all');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setExistingBookings(data.bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to empty bookings array
        setExistingBookings([]);
      }
    };
    
    fetchAllBookings();
  }, []);

  // Fetch time off periods
  useEffect(() => {
    const fetchTimeOffPeriods = async () => {
      try {
        // Get time off for the next month to cover potential reschedule dates
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const fromDate = format(today, 'yyyy-MM-dd');
        const toDate = format(nextMonth, 'yyyy-MM-dd');
        
        const timeOff = await getTimeOffPeriods(fromDate, toDate);
        setTimeOffPeriods(timeOff);
      } catch (error) {
        console.error('Error fetching time off periods:', error);
        setTimeOffPeriods([]);
      }
    };

    fetchTimeOffPeriods();
  }, []);

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointmentDetails = async () => {
        setIsLoading(true);
        try {
          const apptData = await getAppointmentById(appointmentId);
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (apptData) {
            setAppointment(apptData);
            setSelectedDate(new Date(apptData.date));
            setSelectedTime(apptData.time);
          } else {
            toast.error('Appointment not found.');
            router.push('/dashboard?tab=appointments');
          }
        } catch (error) {
          console.error('Error fetching appointment details:', error);
          toast.error('Failed to load appointment details.');
          router.push('/dashboard?tab=appointments');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointmentDetails();
    }
  }, [appointmentId, router]);

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !appointment) return;
    
    // Check if business is open on selected date
    if (!isBusinessOpenOnDate(selectedDate)) {
      setAllTimeSlotsForDate([]);
      setAvailableTimeSlots([]);
      setTimeSlotDisplay({});
      if (selectedTime) {
        setSelectedTime("");
      }
      return;
    }
    
    const formattedDate = formatDateForDB(selectedDate);
    const appointmentDurationMinutes = parseInt(appointment.duration.split(' ')[0], 10);
    
    // Generate time slots based on business hours for this date
    const timeSlotsForDate = generateTimeSlotsForDate(selectedDate, 60);
    setAllTimeSlotsForDate(timeSlotsForDate);
    
    // Get bookings for the selected date, excluding the current appointment
    const dateBookings = existingBookings.filter(booking => {
      // Use standardized date comparison
      return isSameDayUtil(booking.appointment_date, selectedDate) && 
        booking.id !== appointment.id &&
        (booking.status === 'confirmed' || booking.status === 'pending');
    });
    
    // Create a display object for each time slot
    const timeDisplay: Record<string, { available: boolean; reason?: string }> = {};
    
    // Check each time slot against existing bookings and time off
    const available = timeSlotsForDate.filter(timeSlot => {
      // First validate against business hours
      const validation = validateAppointmentTime(selectedDate, timeSlot, appointmentDurationMinutes);
      if (!validation.isValid) {
        timeDisplay[timeSlot] = {
          available: false,
          reason: validation.reason
        };
        return false;
      }
      
      // Check time off conflicts
      const timeOffCheck = isTimeSlotBlockedByTimeOff(timeSlot, selectedDate, appointmentDurationMinutes);
      if (timeOffCheck.blocked) {
        timeDisplay[timeSlot] = {
          available: false,
          reason: timeOffCheck.reason
        };
        return false;
      }

      // Then check booking conflicts
      const overlappingBooking = dateBookings.find(booking => {
        // Assume a default duration of 60 minutes if not specified
        const bookingDurationMin = 60;
        
        return isTimeOverlapping(
          timeSlot, 
          appointmentDurationMinutes, 
          booking.appointment_time, 
          bookingDurationMin
        );
      });
      
      // Store availability and reason
      if (overlappingBooking) {
        const bookingDurationMin = 60; // Default duration for demonstration
        const bookingTimeStart = parseTimeToMinutes(overlappingBooking.appointment_time);
        const bookingTimeEnd = bookingTimeStart + bookingDurationMin;
        
        timeDisplay[timeSlot] = {
          available: false,
          reason: `Conflicts with ${overlappingBooking.service_name} from ${overlappingBooking.appointment_time} to ${formatMinutesToTimeDisplay(bookingTimeEnd)}`
        };
        return false;
      } else {
        // Special case: If this is the original date and time of the appointment, it should be available
        const isOriginalDateAndTime = 
          format(new Date(appointment.date), "yyyy-MM-dd") === formattedDate && 
          appointment.time === timeSlot;
        
        if (isOriginalDateAndTime) {
          timeDisplay[timeSlot] = { 
            available: true, 
            reason: 'Your current appointment time'
          };
        } else {
          timeDisplay[timeSlot] = { available: true };
        }
        return true;
      }
    });
    
    setTimeSlotDisplay(timeDisplay);
    setAvailableTimeSlots(available);
    
    // If the currently selected time is no longer available, reset it
    // But only if it's not the original appointment time on the original date
    const isOriginalDateAndTime = 
      format(new Date(appointment.date), "yyyy-MM-dd") === formattedDate && 
      appointment.time === selectedTime;
      
    if (selectedTime && !available.includes(selectedTime) && !isOriginalDateAndTime) {
      setSelectedTime("");
    }
  }, [selectedDate, appointment, selectedTime, existingBookings, timeOffPeriods]);

  const handleBack = () => {
    router.back();
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointment) {
      toast.error('Please select a new date and time.');
      return;
    }

    // Check if the selected date and time are the same as the original appointment
    const isSameDateTime = 
      format(selectedDate, "yyyy-MM-dd") === format(new Date(appointment.date), "yyyy-MM-dd") && 
      selectedTime === appointment.time;

    if (isSameDateTime) {
      toast.info('You selected the same date and time as your current appointment.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass the user ID from the session if available
      const updatedAppointment = await updateAppointmentDateTime(
        appointment.id, 
        selectedDate, 
        selectedTime,
        userId
      );

      if (updatedAppointment) {
        toast.success('Appointment rescheduled successfully!');
        router.push(`/dashboard?tab=appointments`);
      } else {
        toast.error('Failed to reschedule appointment. The selected slot may no longer be available.');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('An error occurred while rescheduling.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <PageLoader 
        message="Loading Appointment Details" 
        subMessage="Please wait while we prepare the reschedule options..." 
      />
    );
  }

  if (!appointment) {
    // This case should ideally be handled by the redirect in useEffect
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Appointment Not Found</CardTitle>
          </CardHeader>
          <CardFooter className="justify-center pb-6">
            <Button onClick={() => router.push('/dashboard?tab=appointments')} className="bg-primary hover:bg-primary/90 text-white">
              <ArrowLeft className="mr-2" size={16} />
              Back to Appointments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <main className="gradient-bg pt-24 pb-20 min-h-screen">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="content-container relative z-10">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-8 flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back to Appointment Details
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b">
              <CardTitle className="text-2xl text-center">Reschedule Appointment</CardTitle>
              <CardDescription className="text-center">
                <div className="mb-1">Current: {format(new Date(appointment.date), "EEEE, MMMM d, yyyy")} at {appointment.time}</div>
                <div className="mb-1">Service: {appointment.serviceName}</div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Clock size={14} />
                  Duration: {appointment.duration}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select New Date</label>
                <div className="border rounded-md overflow-hidden">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setSelectedDate(date);
                        // Keep the original time if selecting the original date
                        const isSameDate = date.toDateString() === new Date(appointment.date).toDateString();
                        if (!isSameDate) {
                          setSelectedTime(''); // Reset time when date changes to non-original date
                        }
                      }
                    }}
                    minDate={new Date()} // Prevent selecting past dates
                    // maxDate={addMonths(new Date(), 1)} // Optional: limit future booking range
                    inline
                    calendarClassName="!border-0 !shadow-none"
                    dayClassName={(date: Date) => {
                      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                        return "!bg-primary !text-white rounded-full";
                      }
                      // Highlight current appointment date if different from selected
                      if (!selectedDate && date.toDateString() === new Date(appointment.date).toDateString()){
                        return "!bg-primary/20 !text-primary rounded-full";
                      }
                      if (date.toDateString() === new Date().toDateString() && (!selectedDate || selectedDate.toDateString() !== new Date().toDateString() )) {
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
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    {(() => {
                      const businessHours = getBusinessHoursForDate(selectedDate);
                      if (!businessHours.isOpen) {
                        return (
                          <div className="text-center text-red-600 text-xs bg-red-50 p-2 rounded">
                            Closed on {getDayName(selectedDate.getDay())}s
                          </div>
                        );
                      }
                      return (
                        <div className="text-center text-green-600 text-xs bg-green-50 p-2 rounded">
                          Open {businessHours.openTime} - {businessHours.closeTime}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select New Time</label>
                {selectedDate && availableTimeSlots.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                    No available time slots for this date. Please select another date.
                  </div>
                ) : selectedDate ? (
                  <>
                    <Select 
                      value={selectedTime}
                      onValueChange={(value) => setSelectedTime(value)}
                      disabled={!selectedDate || availableTimeSlots.length === 0}
                    >
                      <SelectTrigger className="w-full border rounded-md h-10">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {allTimeSlotsForDate.map((time) => {
                          const timeInfo = timeSlotDisplay[time];
                          const isAvailable = timeInfo?.available !== false;
                          const isCurrentAppointment = 
                            format(selectedDate, "yyyy-MM-dd") === format(new Date(appointment.date), "yyyy-MM-dd") && 
                            time === appointment.time;
                            
                          return (
                            <SelectItem 
                              key={time} 
                              value={time} 
                              disabled={!isAvailable}
                              className={`cursor-pointer ${!isAvailable ? 'opacity-50' : ''} 
                                ${isCurrentAppointment ? 'bg-blue-50' : ''}`}
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span>{time}</span>
                                  {isCurrentAppointment && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Current</span>
                                  )}
                                </div>
                                {!isAvailable && (
                                  <span className="text-xs text-red-500">
                                    {timeInfo?.reason || 'Unavailable'}
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
                      <div className="flex items-center mb-1">
                        <div className="w-3 h-3 bg-blue-100 rounded-full mr-2"></div>
                        <span>Your current appointment time</span>
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
                    <p className="font-medium">Appointment duration: {appointment.duration}</p>
                    <p>Your appointment will end at approximately {
                      (() => {
                        const startTime = parseTimeToMinutes(selectedTime);
                        const endTime = startTime + parseInt(appointment.duration.split(' ')[0], 10);
                        return formatMinutesToTimeDisplay(endTime);
                      })()
                    }</p>
                  </div>
                )}
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-primary" />
                    New Appointment Time
                  </h3>
                  <p className="text-gray-600">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    {' '} at {selectedTime}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 p-6">
              <div className="w-full space-y-4">
                <Button 
                  onClick={handleReschedule} 
                  disabled={
                    !selectedDate || 
                    !selectedTime || 
                    isSubmitting || 
                    (selectedDate.toDateString() === new Date(appointment.date).toDateString() && 
                     selectedTime === appointment.time)
                  }
                  className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium text-lg"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Rescheduling...</>
                  ) : (
                    'Confirm Reschedule'
                  )}
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleBack} 
                  className="w-full text-gray-600 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Please note that rescheduling may be subject to availability.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border: none !important;
          width: 100% !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
        }
        .react-datepicker__day {
          margin: 0.2rem !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          border-radius: 9999px !important;
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
        }
        .react-datepicker__day-name {
          margin: 0.2rem !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          color: #6b7280 !important;
        }
      `}</style>
    </main>
  );
} 