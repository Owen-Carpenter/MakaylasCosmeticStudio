-- Fix users table to ensure it's properly set up
-- First, check if the users table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Create users table if it doesn't exist
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      name VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created users table';
  ELSE
    -- Table exists, check for missing columns and add them if needed
    RAISE NOTICE 'Users table exists, checking columns...';
    
    -- Check for name column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
      ALTER TABLE public.users ADD COLUMN name VARCHAR(255);
      RAISE NOTICE 'Added name column';
    END IF;
    
    -- Check for email column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email') THEN
      ALTER TABLE public.users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
      RAISE NOTICE 'Added email column';
    END IF;
    
    -- Check for phone column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone') THEN
      ALTER TABLE public.users ADD COLUMN phone VARCHAR(50);
      RAISE NOTICE 'Added phone column';
    END IF;
    
    -- Check for role column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
      ALTER TABLE public.users ADD COLUMN role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));
      RAISE NOTICE 'Added role column';
    END IF;
    
    -- Check for timestamps
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at') THEN
      ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE 'Added created_at column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
      ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE 'Added updated_at column';
    END IF;
  END IF;
END $$;

-- Create or replace the timestamp trigger function (outside the DO block)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'users_set_timestamp') THEN
    CREATE TRIGGER users_set_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
    
    RAISE NOTICE 'Added updated_at trigger for users table';
  END IF;
END $$;

-- Create or replace the is_admin function (outside the DO block)
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

-- Create RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Auth service can insert users" ON users;
DROP POLICY IF EXISTS "Auth service can upsert users" ON users;
DROP POLICY IF EXISTS "Allow service role full access to users" ON users;

-- Create policies using the is_admin() function
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (is_admin());

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" 
  ON users FOR UPDATE
  USING (is_admin());

-- Create a policy to handle user creation during signup (INSERT)
CREATE POLICY "Auth service can insert users" 
  ON users FOR INSERT 
  WITH CHECK (true);  -- Allow inserts from trusted code

-- Create a policy to handle user creation during signup (UPDATE for UPSERT)
CREATE POLICY "Auth service can upsert users" 
  ON users FOR UPDATE
  USING (true);  -- Allow updates for upsert operations

-- Create a special policy for the service role to have full access
CREATE POLICY "Allow service role full access to users"
  ON users
  USING (auth.jwt() ? 'service_role');

-- Grant necessary permissions to anon and service roles
GRANT SELECT, INSERT, UPDATE ON users TO anon, service_role, authenticated; 