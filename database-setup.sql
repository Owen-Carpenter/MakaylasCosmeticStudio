-- =====================================================
-- SERVIFY BOOKING SYSTEM - COMPLETE DATABASE SETUP
-- =====================================================
-- This script sets up all tables, functions, triggers, policies, and sample data
-- for the Servify booking system boilerplate.
-- 
-- Run this script in your Supabase SQL Editor to set up the complete database.
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UTILITY FUNCTIONS
-- =====================================================

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =====================================================
-- 2. USERS TABLE
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS users_set_timestamp ON users;
CREATE TRIGGER users_set_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- 3. SERVICES TABLE
-- =====================================================

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  time VARCHAR(50) NOT NULL, -- e.g. "60 min", "2 hours"
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for services table
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS services_set_timestamp ON services;
CREATE TRIGGER services_set_timestamp
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- 4. BOOKINGS TABLE
-- =====================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  appointment_date VARCHAR(255) NOT NULL, -- Stored as string for flexibility
  appointment_time VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  payment_intent VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bookings table
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS bookings_set_timestamp ON bookings;
CREATE TRIGGER bookings_set_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- 5. TIME OFF TABLE
-- =====================================================

-- Create time_off table for admin availability management
CREATE TABLE IF NOT EXISTS public.time_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,
  type VARCHAR(50) DEFAULT 'time_off' CHECK (type IN ('time_off', 'holiday', 'maintenance', 'personal')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_time_range CHECK (
    is_all_day = TRUE OR 
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Create indexes for time_off table
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON time_off(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_type ON time_off(type);
CREATE INDEX IF NOT EXISTS idx_time_off_created_by ON time_off(created_by);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS time_off_set_timestamp ON time_off;
CREATE TRIGGER time_off_set_timestamp
  BEFORE UPDATE ON time_off
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- 6. UTILITY FUNCTIONS FOR TIME OFF
-- =====================================================

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

-- Function to get user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(user_id_param UUID) 
RETURNS SETOF bookings 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM bookings WHERE user_id = user_id_param
  ORDER BY created_at DESC;
$$;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own data
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (is_admin());

-- Users can update their own data
CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any user
CREATE POLICY "Admins can update any user" 
  ON users FOR UPDATE
  USING (is_admin());

-- Allow user creation during signup
CREATE POLICY "Auth service can insert users" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- SERVICES TABLE POLICIES
-- =====================================================

-- Everyone can view services (public access)
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT 
  USING (true);

-- Only admins can modify services
CREATE POLICY "Only admins can modify services" 
  ON services FOR ALL 
  USING (is_admin());

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
  ON bookings FOR SELECT 
  USING (is_admin());

-- Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can modify any booking
CREATE POLICY "Admins can modify any booking" 
  ON bookings FOR ALL
  USING (is_admin());

-- Allow service role full access for API operations
CREATE POLICY "Allow service role full access to bookings"
  ON bookings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- TIME OFF TABLE POLICIES
-- =====================================================

-- Everyone can see time off (customers need to know availability)
CREATE POLICY "Everyone can see time off" 
  ON time_off FOR SELECT 
  USING (true);

-- Admins can manage time off
CREATE POLICY "Admins can manage time off" 
  ON time_off FOR ALL
  USING (is_admin());

-- =====================================================
-- 8. PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT ON services TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT SELECT ON time_off TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON time_off TO authenticated;

-- Grant read permissions for anonymous users
GRANT SELECT ON services TO anon;
GRANT SELECT ON time_off TO anon;

-- =====================================================
-- 9. SAMPLE DATA
-- =====================================================

-- Insert sample services
INSERT INTO services (title, details, time, category, price) VALUES
('Business Consultation', 'One-on-one consultation for your business needs. Our expert consultants will help you identify opportunities for growth, optimize operations, and develop strategic plans tailored to your business goals.', '60 min', 'consulting', 99.00),
('Haircut & Styling', 'Professional haircut and styling service. Our experienced stylists will provide a personalized experience, from consultation to finishing touches, ensuring you leave with a look that suits your style and personality.', '45 min', 'beauty', 49.00),
('Home Repair', 'General home repair and maintenance. Our skilled technicians can handle a wide range of repairs, from fixing leaky faucets to patching drywall, helping you maintain your home in top condition.', '120 min', 'maintenance', 129.00),
('Legal Consultation', 'Professional legal advice for various matters. Our attorneys provide clear guidance on legal issues affecting individuals and businesses, helping you navigate complex legal situations with confidence.', '90 min', 'consulting', 149.00),
('Massage Therapy', 'Relaxing full-body massage to relieve stress. Our certified massage therapists use various techniques to reduce muscle tension, improve circulation, and promote overall well-being.', '60 min', 'beauty', 79.00),
('Web Development', 'Custom website development and design services. We create responsive, modern websites tailored to your business needs, from simple landing pages to complex web applications.', '180 min', 'technology', 199.00),
('Personal Training', 'One-on-one fitness training sessions. Our certified trainers will create a personalized workout plan to help you achieve your fitness goals safely and effectively.', '60 min', 'fitness', 69.00),
('Tax Preparation', 'Professional tax preparation and filing services. Our experienced tax professionals will ensure your taxes are filed accurately and help you maximize your deductions.', '90 min', 'consulting', 89.00)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. SETUP VERIFICATION
-- =====================================================

-- Create a function to verify the setup
CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check tables
  RETURN QUERY
  SELECT 
    'Tables' as component,
    CASE 
      WHEN COUNT(*) = 4 THEN 'OK'
      ELSE 'ERROR'
    END as status,
    'Found ' || COUNT(*) || ' tables (expected 4)' as details
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'services', 'bookings', 'time_off');
  
  -- Check functions
  RETURN QUERY
  SELECT 
    'Functions' as component,
    CASE 
      WHEN COUNT(*) >= 5 THEN 'OK'
      ELSE 'WARNING'
    END as status,
    'Found ' || COUNT(*) || ' functions' as details
  FROM information_schema.routines 
  WHERE routine_schema = 'public'
  AND routine_name IN ('trigger_set_timestamp', 'is_admin', 'check_booking_time_off_conflict', 'get_active_time_off', 'get_user_bookings');
  
  -- Check policies
  RETURN QUERY
  SELECT 
    'Policies' as component,
    CASE 
      WHEN COUNT(*) >= 10 THEN 'OK'
      ELSE 'WARNING'
    END as status,
    'Found ' || COUNT(*) || ' RLS policies' as details
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Check sample data
  RETURN QUERY
  SELECT 
    'Sample Data' as component,
    CASE 
      WHEN COUNT(*) >= 5 THEN 'OK'
      ELSE 'WARNING'
    END as status,
    'Found ' || COUNT(*) || ' sample services' as details
  FROM services;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. COMPLETION MESSAGE
-- =====================================================

-- Display setup completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVIFY BOOKING SYSTEM DATABASE SETUP COMPLETE';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables created: users, services, bookings, time_off';
  RAISE NOTICE 'Functions created: 5+ utility functions';
  RAISE NOTICE 'Policies created: 10+ RLS policies';
  RAISE NOTICE 'Sample data: 8 sample services inserted';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your environment variables';
  RAISE NOTICE '2. Create your first admin user';
  RAISE NOTICE '3. Test the application';
  RAISE NOTICE '';
  RAISE NOTICE 'Run: SELECT * FROM verify_database_setup();';
  RAISE NOTICE 'to verify the setup was successful.';
  RAISE NOTICE '==============================================';
END $$;

-- Run verification
SELECT * FROM verify_database_setup(); 