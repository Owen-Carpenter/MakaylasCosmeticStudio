import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch all bookings with customer information from Supabase
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch bookings" 
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
    console.error("Error retrieving bookings:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    }, { status: 500 });
  }
} 