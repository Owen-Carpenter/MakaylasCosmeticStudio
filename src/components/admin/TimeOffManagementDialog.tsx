"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";
import { CalendarOff, Trash2, Edit } from "lucide-react";
import { deleteTimeOff, type TimeOff } from "@/lib/supabase-timeoff";
import { format } from "date-fns";

interface TimeOffManagementDialogProps {
  timeOff: TimeOff;
  isOpen: boolean;
  onClose: () => void;
  onTimeOffDeleted?: (timeOffId: string) => void;
}

export function TimeOffManagementDialog({ 
  timeOff, 
  isOpen, 
  onClose, 
  onTimeOffDeleted
}: TimeOffManagementDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteTimeOff(timeOff.id);
      
      if (success) {
        toast({
          title: "Time Off Deleted",
          description: "The time off period has been successfully deleted.",
        });
        
        onTimeOffDeleted?.(timeOff.id);
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete time off period. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting time off:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + 'T00:00:00'), 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-red-600" />
            Time Off Details
          </DialogTitle>
          <DialogDescription>
            View and manage this time off period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Title</label>
            <p className="text-lg font-semibold">{timeOff.title}</p>
          </div>

          {/* Description */}
          {timeOff.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm">{timeOff.description}</p>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <div className="mt-1">
              <Badge className="bg-red-100 text-red-800">
                {timeOff.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Date Range</label>
            <p className="text-sm">
              {timeOff.start_date === timeOff.end_date ? (
                formatDate(timeOff.start_date)
              ) : (
                `${formatDate(timeOff.start_date)} - ${formatDate(timeOff.end_date)}`
              )}
            </p>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Time</label>
            <p className="text-sm">
              {timeOff.is_all_day ? (
                'All day'
              ) : timeOff.start_time && timeOff.end_time ? (
                `${formatTime(timeOff.start_time)} - ${formatTime(timeOff.end_time)}`
              ) : (
                'All day'
              )}
            </p>
          </div>

          {/* Created Date */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-xs text-muted-foreground">
              {format(new Date(timeOff.created_at), 'MMM d, yyyy \'at\' h:mm a')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          
          {/* Future: Edit button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // TODO: Implement edit functionality
              toast({
                title: "Coming Soon",
                description: "Edit functionality will be available in a future update.",
              });
            }}
            className="w-full sm:w-auto"
            disabled
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {/* Delete button with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Time Off?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{timeOff.title}&quot;? This action cannot be undone and will make the blocked time slots available for booking again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 