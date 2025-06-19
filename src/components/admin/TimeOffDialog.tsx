"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { CalendarOff } from "lucide-react";
import { createTimeOff, type TimeOff } from "@/lib/supabase-timeoff";
import { format } from "date-fns";

interface TimeOffDialogProps {
  selectedDate?: Date;
  onTimeOffCreated?: (timeOff: TimeOff) => void;
  trigger?: React.ReactNode;
}

export function TimeOffDialog({ selectedDate, onTimeOffCreated, trigger }: TimeOffDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    end_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    start_time: '',
    end_time: '',
    is_all_day: true,
    type: 'time_off' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate dates
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        toast({
          variant: "destructive",
          title: "Invalid Date Range",
          description: "End date must be after or equal to start date.",
        });
        setIsLoading(false);
        return;
      }

      // Validate times if not all day
      if (!formData.is_all_day) {
        if (!formData.start_time || !formData.end_time) {
          toast({
            variant: "destructive",
            title: "Missing Time",
            description: "Please specify start and end times for partial day time off.",
          });
          setIsLoading(false);
          return;
        }

        if (formData.end_time <= formData.start_time) {
          toast({
            variant: "destructive",
            title: "Invalid Time Range",
            description: "End time must be after start time.",
          });
          setIsLoading(false);
          return;
        }
      }

      const timeOffData = {
        ...formData,
        start_time: formData.is_all_day ? undefined : `${formData.start_time}:00`,
        end_time: formData.is_all_day ? undefined : `${formData.end_time}:00`,
      };

      const newTimeOff = await createTimeOff(timeOffData);

      if (newTimeOff) {
        toast({
          title: "Time Off Created",
          description: "The time off period has been successfully created.",
        });

        // Reset form
        setFormData({
          title: '',
          description: '',
          start_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
          end_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
          start_time: '',
          end_time: '',
          is_all_day: true,
          type: 'time_off',
        });

        setIsOpen(false);
        onTimeOffCreated?.(newTimeOff);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create time off period. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating time off:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: '',
        description: '',
        start_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        end_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        start_time: '',
        end_time: '',
        is_all_day: true,
        type: 'time_off',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="bg-white">
            <CalendarOff className="h-4 w-4 mr-2" />
            Add Time Off
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="timeoff-dialog-description">
        <DialogHeader>
          <DialogTitle>Add Time Off</DialogTitle>
          <DialogDescription id="timeoff-dialog-description">
            Block time periods when services are not available for booking.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="timeoff-title">Title *</Label>
            <Input
              id="timeoff-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Vacation, Holiday, Maintenance"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="timeoff-description">Description</Label>
            <Textarea
              id="timeoff-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="timeoff-type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger id="timeoff-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_off">Time Off</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeoff-start-date">Start Date *</Label>
              <Input
                id="timeoff-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="timeoff-end-date">End Date *</Label>
              <Input
                id="timeoff-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="timeoff-all-day"
              checked={formData.is_all_day}
              onChange={(e) => handleInputChange('is_all_day', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="timeoff-all-day" className="text-sm font-medium">
              All day
            </Label>
          </div>

          {!formData.is_all_day && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeoff-start-time">Start Time</Label>
                <Input
                  id="timeoff-start-time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  required={!formData.is_all_day}
                />
              </div>
              <div>
                <Label htmlFor="timeoff-end-time">End Time</Label>
                <Input
                  id="timeoff-end-time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  required={!formData.is_all_day}
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title || !formData.start_date || !formData.end_date}
          >
            {isLoading ? "Creating..." : "Create Time Off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 