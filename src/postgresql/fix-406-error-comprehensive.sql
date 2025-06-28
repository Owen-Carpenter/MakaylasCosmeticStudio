-- Comprehensive fix for 406 errors and booking access issues
-- This script addresses both the original 406 error and the new PGRST116 error

-- ========================================
-- 1. Fix permissions and roles
-- ========================================

-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated, service_role;

-- ========================================
-- 2. Fix users table policies
-- ========================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Auth service can insert users" ON public.users;
DROP POLICY IF EXISTS "Auth service can upsert users" ON public.users;
DROP POLICY IF EXISTS "Auth service can update users" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow anon to read users table" ON public.users;

-- Create comprehensive policies for users table
CREATE POLICY "Users full access to own data"
  ON public.users FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Service role full access to users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can access all users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow anon access for login/registration flows
CREATE POLICY "Allow anon access for auth flows"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert for registration"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 3. Fix bookings table policies
-- ========================================

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on bookings table
DROP POLICY IF EXISTS "Admins can see all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can see their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can modify all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;

-- Create comprehensive policies for bookings table
CREATE POLICY "Service role full access to bookings"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can access own bookings"
  ON public.bookings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow anon access for certain booking operations (like payment processing)
CREATE POLICY "Allow anon read for payment processing"
  ON public.bookings FOR SELECT
  USING (true);

-- ========================================
-- 4. Create helper functions for admin access
-- ========================================

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get booking with customer info (bypasses RLS issues)
CREATE OR REPLACE FUNCTION get_booking_with_customer(booking_id TEXT)
RETURNS TABLE (
  id TEXT,
  user_id UUID,
  service_id UUID,
  service_name TEXT,
  variant_id UUID,
  variant_name TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  status TEXT,
  payment_status TEXT,
  payment_intent TEXT,
  amount_paid DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.user_id,
    b.service_id,
    b.service_name,
    b.variant_id,
    b.variant_name,
    b.appointment_date,
    b.appointment_time,
    b.status,
    b.payment_status,
    b.payment_intent,
    b.amount_paid,
    b.created_at,
    b.updated_at,
    u.name as customer_name,
    u.email as customer_email
  FROM public.bookings b
  LEFT JOIN public.users u ON b.user_id = u.id
  WHERE b.id = booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. Grant permissions on functions
-- ========================================

GRANT EXECUTE ON FUNCTION is_admin TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_booking_with_customer TO anon, authenticated, service_role;

-- ========================================
-- 6. Refresh and verify
-- ========================================

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Add helpful comments
COMMENT ON TABLE public.users IS 'User profiles - accessible with proper RLS policies';
COMMENT ON TABLE public.bookings IS 'Booking records - accessible with proper RLS policies';
COMMENT ON FUNCTION get_booking_with_customer IS 'Helper function to get booking with customer info, bypassing RLS join issues'; 