import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking ID is required" 
      }, { status: 400 });
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    console.log("User fetching booking:", session.user.email, "booking ID:", id);
    
    // Fetch the booking by ID from Supabase with customer information
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching booking by ID:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch booking" 
      }, { status: 500 });
    }
    
    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking not found" 
      }, { status: 404 });
    }
    
    // Check if user is authorized to view this booking
    const isAdmin = session.user.role === 'admin';
    const isOwner = session.user.id === booking.user_id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ 
        success: false, 
        message: "You don't have permission to view this booking" 
      }, { status: 403 });
    }
    
    // Transform the data to include customer info in the main booking object
    const customerData = booking.users || {};
    const bookingWithCustomerInfo = {
      ...booking,
      customer_name: customerData.name || null,
      customer_email: customerData.email || null,
      users: undefined // Remove the nested users object
    };
    
    return NextResponse.json({ 
      success: true, 
      booking: bookingWithCustomerInfo
    });
  } catch (error) {
    console.error("Error retrieving booking by ID:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch booking" 
    }, { status: 500 });
  }
} 