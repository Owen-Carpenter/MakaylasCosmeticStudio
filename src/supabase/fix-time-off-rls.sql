-- Fix time-off RLS policies and admin role setup

-- First, let's check and update your current user to have admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';  -- Update this with your actual email

-- Drop existing problematic policies for time_off table
DROP POLICY IF EXISTS "Everyone can see time off" ON time_off;
DROP POLICY IF EXISTS "Admins can manage time off" ON time_off;

-- Create a better function to check admin status
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

-- Create new, more reliable policies for time_off table
CREATE POLICY "Everyone can see time off" 
  ON time_off FOR SELECT 
  USING (true);

-- For INSERT/UPDATE/DELETE, use a more permissive approach initially
CREATE POLICY "Authenticated users can manage time off" 
  ON time_off FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Alternative: If you want to be more restrictive, use this policy instead
-- (comment out the above policy and uncomment this one)
/*
CREATE POLICY "Admins can manage time off" 
  ON time_off FOR ALL
  USING (is_admin());
*/

-- Grant necessary permissions
GRANT ALL ON time_off TO authenticated;
GRANT SELECT ON time_off TO anon;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS set_timestamp_time_off ON time_off;
CREATE TRIGGER set_timestamp_time_off
BEFORE UPDATE ON time_off
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Display current user info for debugging
SELECT 'Current user information:' as info;
SELECT 
  id, 
  email, 
  role,
  CASE 
    WHEN role = 'admin' THEN 'User is admin ✓'
    ELSE 'User is NOT admin ✗'
  END as admin_status
FROM users 
WHERE email = 'your-email@example.com';  -- Update this with your actual email 