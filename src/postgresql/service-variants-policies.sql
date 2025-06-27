-- =====================================================
-- SERVICE VARIANTS RLS POLICIES
-- =====================================================
-- Run this after the migration to set up Row Level Security policies
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service variants are viewable by everyone" ON service_variants;
DROP POLICY IF EXISTS "Service variants can only be modified by admins" ON service_variants;

-- Create fresh policies for service_variants
CREATE POLICY "Service variants are viewable by everyone" 
  ON service_variants FOR SELECT 
  USING (true);

CREATE POLICY "Service variants can only be modified by admins" 
  ON service_variants FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SERVICE VARIANTS POLICIES CREATED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Policies created for service_variants table:';
  RAISE NOTICE '- Public read access for all users';
  RAISE NOTICE '- Admin-only write access';
  RAISE NOTICE '==============================================';
END $$; 