-- Add reminder tracking columns to bookings table
-- This migration adds columns to track when reminder emails have been sent

-- Add columns for tracking reminder emails
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_24h_sent TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reminder_1h_sent TIMESTAMPTZ NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN bookings.reminder_24h_sent IS 'Timestamp when 24-hour reminder email was sent';
COMMENT ON COLUMN bookings.reminder_1h_sent IS 'Timestamp when 1-hour reminder email was sent';

-- Create index for efficient querying of appointments needing reminders
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h ON bookings(appointment_date, status, reminder_24h_sent) 
WHERE status = 'confirmed' AND reminder_24h_sent IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_reminder_1h ON bookings(appointment_date, appointment_time, status, reminder_1h_sent) 
WHERE status = 'confirmed' AND reminder_1h_sent IS NULL;

-- Update RLS policies to allow the service role to update reminder columns
-- (The existing RLS policies should already handle this, but we're being explicit)

-- Verify the structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('reminder_24h_sent', 'reminder_1h_sent');

-- Show the new indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bookings' 
AND indexname LIKE '%reminder%'; 