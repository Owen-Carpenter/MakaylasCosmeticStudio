# Fixing User Registration Issues

Follow these steps to fix the "Error inserting user into users table" issue:

## Step 1: Fix Database Tables and Policies

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of the `fix-users-table.sql` file
4. Run the script

This script will:
- Ensure the users table exists with all required columns
- Add any missing columns if the table already exists
- Set up proper triggers for updating timestamps
- Create appropriate RLS policies for the users table
- Create a special policy to allow user creation during signup

## Step 2: Test User Registration

After running the SQL script:

1. Stop your development server
2. Clear your browser cache
3. Restart your application with `npm run dev`
4. Try registering a new user

## Step 3: Check Console Logs

If you still encounter issues, check the console logs for detailed error information. The updated registration function includes extensive logging that will help identify the specific problem.

## Common Issues and Solutions

### 1. Foreign Key Constraint Failures

If you see errors about foreign key constraints, it means the user ID from auth.users doesn't exist or can't be referenced.

Solution: Make sure the `auth.users` table exists and has the user record before trying to insert into the users table.

### 2. Unique Constraint Violations

If you see error code '23505', it means a user with that ID already exists in the users table.

Solution: The updated code now tries an upsert operation when this happens, which should resolve the issue.

### 3. Permission Issues

If you see permission errors, it means the RLS policies are preventing the insert.

Solution: The script adds a policy specifically to allow inserts during registration.

## Understanding the Fix

The main fixes implemented are:

1. **Better Error Handling**: The registration function now includes detailed error logging
2. **Alternative Insert Methods**: If a standard insert fails, the code tries an upsert operation
3. **Proper Database Setup**: The SQL script ensures the database is properly configured
4. **Relaxed Insert Permissions**: A special RLS policy allows inserts during registration

## Next Steps

If you continue to experience issues after following these steps, check:

1. The Supabase logs in the dashboard for additional error information
2. Verify that your environment variables are correctly set
3. Make sure your Supabase project has the correct permissions enabled 