import { supabase } from "@/lib/auth";
import { Service } from "@/lib/services";

// Get all services from Supabase with optional filtering by category
export async function getServices(category?: string): Promise<Service[]> {
  try {
    let query = supabase.from("services").select("*");
    
    // Apply category filter if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    
    // Execute query with order by title
    const { data, error } = await query.order("title");
    
    if (error) {
      console.error("Error fetching services:", error);
      return [];
    }
    
    return data as Service[];
  } catch (error) {
    console.error("Error in getServices:", error);
    return [];
  }
}

// Get a single service by ID
export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !data) {
      console.error("Error fetching service by ID:", error);
      return null;
    }
    
    return data as Service;
  } catch (error) {
    console.error("Error in getServiceById:", error);
    return null;
  }
}

// For admin use - create a new service
export async function createService(service: Omit<Service, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("services")
      .insert(service)
      .select("id")
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

// For admin use - update an existing service
export async function updateService(id: string, updates: Partial<Omit<Service, "id" | "created_at" | "updated_at">>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("services")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

// For admin use - delete a service
export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
} 