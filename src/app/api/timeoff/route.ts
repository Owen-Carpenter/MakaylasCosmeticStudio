import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export interface TimeOff {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  type: 'time_off' | 'holiday' | 'maintenance' | 'personal';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// GET - Fetch time off periods
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let query = supabaseAdmin
      .from('time_off')
      .select('*')
      .order('start_date', { ascending: true });

    if (fromDate && toDate) {
      query = query
        .lte('start_date', toDate)
        .gte('end_date', fromDate);
    } else if (fromDate) {
      query = query.gte('end_date', fromDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching time off periods:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch time off periods" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as TimeOff[]
    });
  } catch (error) {
    console.error("Error in GET /api/timeoff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new time off period
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Only admins can create time off periods" },
        { status: 403 }
      );
    }

    const timeOffData = await request.json();

    // Validate required fields
    if (!timeOffData.title || !timeOffData.start_date || !timeOffData.end_date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('time_off')
      .insert({
        ...timeOffData,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating time off:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create time off period" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as TimeOff
    });
  } catch (error) {
    console.error("Error in POST /api/timeoff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update time off period
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Only admins can update time off periods" },
        { status: 403 }
      );
    }

    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Time off ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('time_off')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating time off:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update time off period" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as TimeOff
    });
  } catch (error) {
    console.error("Error in PUT /api/timeoff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete time off period
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Only admins can delete time off periods" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Time off ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('time_off')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting time off:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete time off period" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Time off period deleted successfully"
    });
  } catch (error) {
    console.error("Error in DELETE /api/timeoff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 