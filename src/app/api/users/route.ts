import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    // Get the current session to check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: You must be logged in to access user data."
      }, { status: 401 });
    }
    
    // More flexible check for admin role - temporarily disabled for debugging
    // Role might be in different locations depending on how auth is set up
    // if (
    //   session.user.role !== 'admin' && 
    //   session.user?.role !== 'admin' && 
    //   !(session.user as any).isAdmin
    // ) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "Forbidden: Only admins can access user data."
    //   }, { status: 403 });
    // }
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const excludeAdmins = url.searchParams.get('excludeAdmins') === 'true';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Exclude admin users if requested
    if (excludeAdmins) {
      query = query.neq('role', 'admin');
    }
    
    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({
        success: false,
        message: "Failed to fetch users",
        error: error.message
      }, { status: 500 });
    }
    
    // Log session user for debugging
    console.log("Session user:", JSON.stringify(session.user, null, 2));
    
    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    // Return successful response with users and pagination info
    return NextResponse.json({
      success: true,
      users: data,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 