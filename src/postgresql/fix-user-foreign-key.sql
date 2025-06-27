-- =====================================================
-- FIX USER FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script removes the foreign key constraint between 
-- public.users and auth.users to fix booking issues
-- when using NextAuth instead of Supabase Auth
-- =====================================================

-- Drop the foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Recreate the users table structure without the foreign key constraint
-- but keep the same primary key constraint
ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;

-- Add a comment to document the change
COMMENT ON TABLE public.users IS 'Users table - ID references NextAuth user sessions, not auth.users';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'FOREIGN KEY CONSTRAINT REMOVED SUCCESSFULLY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'The users table no longer requires entries in auth.users';
  RAISE NOTICE 'This allows NextAuth users to be created directly';
  RAISE NOTICE '==============================================';
END $$; 