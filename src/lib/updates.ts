import { toast } from "@/components/ui/use-toast";

// Update types
export type UpdateType = 'appointment' | 'service' | 'system' | 'payment';

// Update importance
export type UpdateImportance = 'low' | 'medium' | 'high';

// Update interface
export interface Update {
  id: string;
  type: UpdateType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  importance: UpdateImportance;
  relatedId?: string; // ID of related appointment or service
}

// Helper function to create a valid date or fallback to current date
function createValidDate(dayOffset: number): Date {
  try {
    return new Date(Date.now() + 86400000 * dayOffset);
  } catch (error) {
    console.error("Error creating date with offset", dayOffset, error);
    return new Date(); // Fallback to current date
  }
}

// Sample data (in a real app, this would be fetched from an API)
const mockUpdates: Update[] = [
  {
    id: "update-1",
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your Business Consultation appointment has been confirmed for Wednesday at 10:00 AM.",
    date: createValidDate(-1), // 1 day ago
    read: false,
    importance: "medium",
    relatedId: "appt-1"
  },
  {
    id: "update-2",
    type: "service",
    title: "Service Change",
    message: "There has been a slight change to the Haircut & Styling service. Please arrive 10 minutes early for your appointment.",
    date: createValidDate(-0.5), // 12 hours ago
    read: false,
    importance: "medium",
    relatedId: "appt-2"
  },
  {
    id: "update-3",
    type: "system",
    title: "System Maintenance",
    message: "Our system will be undergoing maintenance on Saturday from 2AM to 4AM. Service booking might be unavailable during this time.",
    date: createValidDate(-3), // 3 days ago
    read: true,
    importance: "low"
  },
  {
    id: "update-4",
    type: "payment",
    title: "Payment Processed",
    message: "Your payment of $129 for Home Repair service has been successfully processed.",
    date: createValidDate(-2), // 2 days ago
    read: false,
    importance: "high",
    relatedId: "appt-4"
  }
];

/**
 * Get all updates for the current user
 * In a real app, this would likely fetch from an API with authentication
 */
export async function getUpdates(): Promise<Update[]> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure all dates are valid
      const validatedUpdates = mockUpdates.map(update => ({
        ...update,
        date: update.date instanceof Date && !isNaN(update.date.getTime())
          ? update.date
          : new Date()
      }));
      
      resolve(validatedUpdates);
    }, 800);
  });
}

/**
 * Get only unread updates for the current user
 * @returns Array of unread updates
 */
export async function getUnreadUpdates(): Promise<Update[]> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // First validate all dates, then filter for unread
      const validatedUpdates = mockUpdates.map(update => ({
        ...update,
        date: update.date instanceof Date && !isNaN(update.date.getTime())
          ? update.date
          : new Date()
      }));
      
      const unreadUpdates = validatedUpdates.filter(update => !update.read);
      resolve(unreadUpdates);
    }, 800);
  });
}

/**
 * Mark an update as read
 * @param updateId The ID of the update to mark as read
 * @returns The updated update object or null if not found
 */
export async function markUpdateAsRead(updateId: string): Promise<Update | null> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const updateIndex = mockUpdates.findIndex(
        (update) => update.id === updateId
      );

      if (updateIndex === -1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Update not found",
        });
        resolve(null);
        return;
      }

      // Check if update is already read
      if (mockUpdates[updateIndex].read) {
        resolve(mockUpdates[updateIndex]);
        return;
      }

      // Mark the update as read
      mockUpdates[updateIndex] = {
        ...mockUpdates[updateIndex],
        read: true,
      };

      resolve(mockUpdates[updateIndex]);
    }, 600);
  });
}

/**
 * Mark all updates as read
 * @returns Boolean indicating success or failure
 */
export async function markAllUpdatesAsRead(): Promise<boolean> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mark all updates as read
      mockUpdates.forEach((update, index) => {
        mockUpdates[index] = {
          ...update,
          read: true,
        };
      });

      toast({
        variant: "success",
        title: "Updates Marked as Read",
        description: "All updates have been marked as read",
      });

      resolve(true);
    }, 800);
  });
} 