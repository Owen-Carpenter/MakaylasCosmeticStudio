-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  appointment_date VARCHAR(255) NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  payment_intent VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add RLS (Row Level Security) policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy for admin to see all bookings
CREATE POLICY "Admins can see all bookings" 
  ON bookings FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Policy for users to see only their own bookings
CREATE POLICY "Users can see their own bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for admin to insert/update/delete any booking
CREATE POLICY "Admins can modify all bookings" 
  ON bookings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Policy for users to insert their own bookings (system will handle most inserts)
CREATE POLICY "Users can insert their own bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at functionality
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 