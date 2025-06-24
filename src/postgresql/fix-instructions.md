# Fixing Supabase Database Issues

Follow these steps to fix the infinite recursion error and other policy issues in your Supabase database.

## Step 1: Run the Fix SQL Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of the `fix-policies.sql` file
4. Run the script

This script will:
- Drop ALL existing policies to start fresh
- Create a simple `is_admin()` function to avoid recursion
- Set up clean, simple policies for all tables
- Use the `is_admin()` function for all admin checks

## Step 2: Verify the Changes

After running the script, verify that the policies were created correctly:

```sql
-- List all policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
ORDER BY tablename, policyname;
```

You should see policies for all three tables (users, services, bookings).

## Step 3: Test the Services Table

Test that the services table is accessible:

```sql
-- This should return all services without any errors
SELECT * FROM services LIMIT 5;
```

## Step 4: Restart Your Application

After making these database changes:

1. Stop your development server
2. Clear your browser cache
3. Restart your application with `npm run dev`

## Step 5: Test User Flows

Test the following user flows to ensure everything is working:

1. Non-authenticated user viewing services
2. Authenticated user viewing services
3. Admin user managing services
4. User viewing their own bookings
5. Admin viewing all bookings

## Understanding the Fix

The original error occurred because of an infinite recursion in the RLS policies. This happens when a policy for a table queries the same table it's protecting, creating an endless loop.

The fix changes the policy structure to:

1. Use a dedicated `is_admin()` function for all admin checks
2. Keep policies as simple as possible
3. Avoid complex subqueries in policies

## Key Improvements

1. **Simplified Admin Checks**: All admin checks now use the `is_admin()` function
2. **Clean Policy Structure**: Each table has clear, focused policies
3. **No Recursion**: The `is_admin()` function is marked as `SECURITY DEFINER` to avoid recursion
4. **Fresh Start**: All existing policies are dropped to avoid conflicts

## Future Policy Design

When creating RLS policies in the future:

1. Use the `is_admin()` function for admin checks
2. Keep policies as simple as possible
3. Avoid complex subqueries in policies
4. Test policies thoroughly before deploying 