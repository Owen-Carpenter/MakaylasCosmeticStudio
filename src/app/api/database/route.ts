import { NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';

/**
 * This endpoint sets up the necessary database functions for the application
 * It should only be called once during initial setup or when DB schema changes
 */
export async function GET() {
  try {
    // Try to call setup procedure if it exists
    const { error: procError } = await supabase.rpc('setup_get_user_bookings_procedure', {});
    
    if (procError) {
      console.error("Error setting up get_user_bookings procedure:", procError);
      
      // Try creating the function directly with raw SQL
      // Note: This requires proper admin credentials and may not work with the anon key
      const { error: sqlError } = await supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session) {
          return { error: new Error("No authenticated session for admin operations") };
        }
        
        // Use raw SQL execution if available (requires admin privileges)
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Apikey': `${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              query: `
                CREATE OR REPLACE FUNCTION get_user_bookings(user_id_param UUID) 
                RETURNS SETOF bookings 
                LANGUAGE sql
                SECURITY DEFINER
                AS $$
                  SELECT * FROM bookings WHERE user_id = user_id_param
                  ORDER BY created_at DESC;
                $$;
              `
            })
          }
        );
        
        if (!result.ok) {
          const errorData = await result.json();
          return { error: new Error(`Failed to execute SQL: ${JSON.stringify(errorData)}`) };
        }
        
        return { error: null };
      });
      
      if (sqlError) {
        console.error("Error creating function directly:", sqlError);
        return NextResponse.json({ 
          success: false, 
          error: "Failed to create database procedures. Please contact an administrator to set up the required database functions." 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Database procedures created successfully" 
    });
    
  } catch (error) {
    console.error("Error setting up database procedures:", error);
    return NextResponse.json({ 
      success: false, 
      error: "An unexpected error occurred" 
    }, { status: 500 });
  }
} 