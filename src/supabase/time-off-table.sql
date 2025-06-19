-- Create time_off table for admin availability management
CREATE TABLE IF NOT EXISTS time_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,
  type VARCHAR(50) DEFAULT 'time_off' CHECK (type IN ('time_off', 'holiday', 'maintenance', 'personal')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_time_range CHECK (
    is_all_day = TRUE OR 
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON time_off(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_type ON time_off(type);
CREATE INDEX IF NOT EXISTS idx_time_off_created_by ON time_off(created_by);

-- Add RLS (Row Level Security) policies
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

-- Policy for everyone to see time off (customers need to know when services aren't available)
CREATE POLICY "Everyone can see time off" 
  ON time_off FOR SELECT 
  USING (true);

-- Policy for admin to insert/update/delete time off
CREATE POLICY "Admins can manage time off" 
  ON time_off FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Triggers for updated_at functionality
CREATE TRIGGER set_timestamp_time_off
BEFORE UPDATE ON time_off
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to check if a booking conflicts with time off
CREATE OR REPLACE FUNCTION check_booking_time_off_conflict(
  booking_date DATE,
  booking_start_time TIME,
  booking_end_time TIME
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM time_off
    WHERE booking_date >= start_date 
    AND booking_date <= end_date
    AND (
      is_all_day = TRUE
      OR (
        start_time IS NOT NULL 
        AND end_time IS NOT NULL
        AND NOT (booking_end_time <= start_time OR booking_start_time >= end_time)
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get active time off periods
CREATE OR REPLACE FUNCTION get_active_time_off(
  from_date DATE DEFAULT CURRENT_DATE,
  to_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN,
  type VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.start_date,
    t.end_date,
    t.start_time,
    t.end_time,
    t.is_all_day,
    t.type
  FROM time_off t
  WHERE t.end_date >= from_date 
  AND t.start_date <= to_date
  ORDER BY t.start_date, t.start_time;
END;
$$ LANGUAGE plpgsql; 