"use client";

import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from '@/lib/appointments';
import type { TimeOff } from '@/lib/supabase-timeoff';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarOff } from "lucide-react";

// Add custom styles for time-off events
const timeOffStyles = `
  .rbc-event.timeoff-event {
    z-index: 1000 !important;
    border: 2px solid #991b1b !important;
    background-color: #dc2626 !important;
    color: white !important;
    font-weight: 600 !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
  
  .rbc-event.timeoff-event:hover {
    background-color: #b91c1c !important;
    border-color: #7f1d1d !important;
  }
  
  .rbc-event-allday.timeoff-event {
    margin-bottom: 2px !important;
    height: auto !important;
    min-height: 20px !important;
  }
  
  .rbc-day-slot .rbc-events-container {
    margin-right: 0 !important;
  }
  
  .rbc-event-content {
    font-size: 11px !important;
    line-height: 1.2 !important;
  }
`;

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Event-like interface for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  allDay?: boolean;
  resource?: {
    type: 'appointment' | 'timeoff';
    data: Appointment | TimeOff;
  };
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  timeOffPeriods?: TimeOff[];
  onSelectEvent?: (appointment: Appointment) => void;
  onSelectTimeOff?: (timeOff: TimeOff) => void;
}

export function AppointmentCalendar({ 
  appointments, 
  timeOffPeriods = [], 
  onSelectEvent,
  onSelectTimeOff 
}: AppointmentCalendarProps) {
  const [date, setDate] = useState(new Date());
  
  // Convert appointments to calendar events
  const appointmentEvents: CalendarEvent[] = appointments.map((appointment: Appointment) => {
    // Handle date parsing more carefully
    let start: Date;
    if (appointment.date instanceof Date) {
      start = new Date(appointment.date);
    } else {
      // If it's a string, parse it carefully
      start = new Date(appointment.date + 'T00:00:00');
    }
    
    // Parse time and set it properly
    const timeParts = appointment.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      start.setHours(hours, minutes, 0, 0);
    }
    
    const end = new Date(start);
    end.setHours(end.getHours() + 1); // Assuming 1-hour duration
    
    return {
      id: appointment.id,
      title: appointment.serviceName,
      start,
      end,
      status: appointment.status,
      resource: {
        type: 'appointment',
        data: appointment
      }
    };
  });

  // Convert time-off periods to calendar events
  const timeOffEvents: CalendarEvent[] = timeOffPeriods.map((timeOff: TimeOff) => {
    // Parse dates correctly to avoid timezone issues
    const startDate = new Date(timeOff.start_date + 'T00:00:00');
    const endDate = new Date(timeOff.end_date + 'T00:00:00');
    
    // For all-day events or multi-day events
    if (timeOff.is_all_day || timeOff.start_date !== timeOff.end_date) {
      // For single day all-day events, end should be the same day
      // For multi-day events, add one day to end date for proper calendar display
      const calendarEndDate = new Date(endDate);
      if (timeOff.start_date !== timeOff.end_date) {
        calendarEndDate.setDate(calendarEndDate.getDate() + 1);
      } else {
        // Single day all-day event - end at 23:59:59 of the same day
        calendarEndDate.setHours(23, 59, 59, 999);
      }
      
      return {
        id: `timeoff-${timeOff.id}`,
        title: `${timeOff.title}`,
        start: startDate,
        end: calendarEndDate,
        status: 'timeoff',
        allDay: true,
        resource: {
          type: 'timeoff',
          data: timeOff
        }
      };
    } else {
      // For specific time periods on the same day
      const start = new Date(startDate);
      const end = new Date(startDate); // Same day
      
      if (timeOff.start_time && timeOff.end_time) {
        const [startHour, startMinute] = timeOff.start_time.split(':').map(Number);
        const [endHour, endMinute] = timeOff.end_time.split(':').map(Number);
        
        start.setHours(startHour, startMinute, 0, 0);
        end.setHours(endHour, endMinute, 0, 0);
      } else {
        // If no specific times, treat as all-day
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      
      return {
        id: `timeoff-${timeOff.id}`,
        title: `${timeOff.title}`,
        start,
        end,
        status: 'timeoff',
        allDay: false,
        resource: {
          type: 'timeoff',
          data: timeOff
        }
      };
    }
  });

  // Combine all events
  const events: CalendarEvent[] = [...appointmentEvents, ...timeOffEvents];

  // Apply custom styling based on appointment status or time-off type
  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: '#3F88C5', // Steel blue - primary color
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '12px',
      padding: '2px 4px'
    };

    if (event.status === 'timeoff') {
      // Special styling for time-off periods to distinguish from appointments
      style.backgroundColor = '#dc2626'; // Red-600 for time off
      style.opacity = 0.85;
      style.borderRadius = '3px';
      style.border = '2px solid #991b1b'; // Red-800 border
      style.fontSize = '11px';
      style.padding = '1px 3px';
      return { 
        style,
        className: 'timeoff-event' // Add custom class for additional CSS if needed
      };
    }

    // Map appointment status to new color palette
    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#10b981'; // Green-500 for confirmed
        break;
      case 'pending':
        style.backgroundColor = '#f59e0b'; // Amber-500 for pending
        break;
      case 'cancelled':
        style.backgroundColor = '#6b7280'; // Gray-500 for cancelled
        style.opacity = 0.6;
        break;
      case 'completed':
        style.backgroundColor = '#3b82f6'; // Blue-500 for completed
        break;
      default:
        style.backgroundColor = '#3F88C5'; // Steel blue default
    }
    
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource?.type === 'appointment' && onSelectEvent) {
      const appointment = appointments.find(a => a.id === event.id);
      if (appointment) {
        onSelectEvent(appointment);
      }
    } else if (event.resource?.type === 'timeoff' && onSelectTimeOff) {
      const timeOff = event.resource.data as TimeOff;
      onSelectTimeOff(timeOff);
    }
  };
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: timeOffStyles }} />
      <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl">Appointment Calendar</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}
              >
                <span className="hidden sm:inline">Previous Month</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}
              >
                <span className="hidden sm:inline">Next Month</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-muted-foreground mr-2">Legend:</span>
            <Badge className="bg-green-100 text-green-800 text-xs">Confirmed</Badge>
            <Badge className="bg-orange-100 text-orange-800 text-xs">Pending</Badge>
            <Badge className="bg-blue-100 text-blue-800 text-xs">Completed</Badge>
            <Badge className="bg-red-100 text-red-800 text-xs">
              <CalendarOff className="h-3 w-3 mr-1" />
              Time Off
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[400px] sm:h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month']}
              view="month"
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              popup
              step={30}
              timeslots={2}
              showMultiDayTimes={false}
              dayLayoutAlgorithm="no-overlap"
              tooltipAccessor={(event: CalendarEvent) => {
                if (event.status === 'timeoff' && event.resource?.type === 'timeoff') {
                  const timeOff = event.resource.data as TimeOff;
                  return `🚫 ${timeOff.title}\nType: ${timeOff.type.replace('_', ' ')}\n${timeOff.description || ''}`;
                }
                
                const statusText = event.status.charAt(0).toUpperCase() + event.status.slice(1);
                return `${event.title}\nStatus: ${statusText}`;
              }}
              components={{
                toolbar: () => null,
                event: ({ event }) => (
                  <div className={`p-1 text-xs sm:text-sm truncate ${
                    event.status === 'timeoff' 
                      ? 'font-medium flex items-center' 
                      : ''
                  }`}>
                    {event.status === 'timeoff' && (
                      <span className="mr-1">🚫</span>
                    )}
                    {event.title}
                  </div>
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
} 