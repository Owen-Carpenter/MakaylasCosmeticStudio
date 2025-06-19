-- First, drop all existing policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create a simple function to check if a user is an admin
-- This avoids recursion by using a direct query
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

-- SIMPLE POLICIES FOR SERVICES TABLE
-- Allow everyone to view services (no authentication required)
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT 
  USING (true);

-- Only allow admins to modify services
CREATE POLICY "Only admins can modify services" 
  ON services FOR ALL 
  USING (is_admin());

-- SIMPLE POLICIES FOR USERS TABLE
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

-- SIMPLE POLICIES FOR BOOKINGS TABLE
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