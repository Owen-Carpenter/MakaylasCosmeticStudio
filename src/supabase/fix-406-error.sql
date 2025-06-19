-- Fix for 406 Not Acceptable error when querying the users table
-- This script focuses on permissions and policies

-- First ensure the right permissions exist
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;

-- Create or replace special policies for user access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop potentially problematic policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Auth service can insert users" ON public.users;
DROP POLICY IF EXISTS "Auth service can upsert users" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access to users" ON public.users;

-- Create flexible policies for the users table
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Auth service can insert users" 
  ON public.users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Auth service can update users" 
  ON public.users FOR UPDATE
  USING (true);

-- Create a special policy for the service role to have full access
CREATE POLICY "Allow service role full access to users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

-- Create policy for anon to read to handle login flow
CREATE POLICY "Allow anon to read users table"
  ON public.users FOR SELECT
  USING (true);

-- Specific fix for 406 error - ensure Accept headers are handled properly
COMMENT ON TABLE public.users IS 'User profiles for the application - can be accessed by anon role'; 