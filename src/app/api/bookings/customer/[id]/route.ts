import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    
    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Customer ID is required" 
      }, { status: 400 });
    }
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Check if user is admin
    const isAdmin = session.user.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "Only admins can access customer bookings" 
      }, { status: 403 });
    }
    
    // Fetch customer bookings with customer information
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching customer bookings:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch customer bookings" 
      }, { status: 500 });
    }
    
    // Transform the data to include customer info in the main booking object
    const bookingsWithCustomerInfo = (bookings || []).map(booking => {
      const customerData = booking.users || {};
      return {
        ...booking,
        customer_name: customerData.name || null,
        customer_email: customerData.email || null,
        users: undefined // Remove the nested users object
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      bookings: bookingsWithCustomerInfo 
    });
  } catch (error) {
    console.error("Error in customer bookings API:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 