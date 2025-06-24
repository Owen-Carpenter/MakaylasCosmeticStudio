# Setting up the Services Table in Supabase

This document provides instructions for setting up the `services` table in your Supabase project.

## Prerequisites

1. A Supabase account and project
2. Proper access to execute SQL in the SQL Editor

## Instructions

1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to the SQL Editor in the left sidebar
4. Create a new query
5. Paste the contents of `services-table.sql` into the SQL editor
6. Execute the query
7. Verify the table has been created by checking the Table Editor

## SQL Script

The SQL script creates:
- A `services` table with fields for title, details, time, category, and price
- An index on the category field for faster queries
- Row-level security policies to control access to the services data

## Sample Data

The script includes commented-out sample data insertions. If you want to add this sample data to your table:
1. Uncomment the INSERT statements in the SQL script 
2. Run the query again, or run just the INSERT portion

## Updating the Application

After setting up the table:
1. Make sure your Supabase connection is properly configured
2. Use the functions in `src/lib/supabase-services.ts` to interact with the services table

## Troubleshooting

If you encounter errors:
- Make sure your Supabase project has the correct permissions set up
- Check that the table doesn't already exist
- Verify that the RLS policies are compatible with your authentication setup 