-- Quick fix for time-off RLS - allows all authenticated users temporarily

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can see time off" ON time_off;
DROP POLICY IF EXISTS "Admins can manage time off" ON time_off;
DROP POLICY IF EXISTS "Authenticated users can manage time off" ON time_off;

-- Allow everyone to read time off
CREATE POLICY "Everyone can see time off" 
  ON time_off FOR SELECT 
  USING (true);

-- Allow any authenticated user to manage time off (temporary fix)
CREATE POLICY "Authenticated users can manage time off" 
  ON time_off FOR INSERT, UPDATE, DELETE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON time_off TO authenticated;
GRANT SELECT ON time_off TO anon;

-- Check if the table exists and show its structure
SELECT 'time_off table info:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'time_off' 
ORDER BY ordinal_position; 