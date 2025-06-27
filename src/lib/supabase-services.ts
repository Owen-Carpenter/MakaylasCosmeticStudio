import { supabase } from "@/lib/auth";
import { Service, ServiceVariant } from "@/lib/services";

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

// Get service variants for a specific service
export async function getServiceVariants(serviceId: string): Promise<ServiceVariant[]> {
  try {
    const { data, error } = await supabase
      .from("service_variants")
      .select("*")
      .eq("service_id", serviceId)
      .order("sort_order");
    
    if (error) {
      console.error("Error fetching service variants:", error);
      return [];
    }
    
    return data as ServiceVariant[];
  } catch (error) {
    console.error("Error in getServiceVariants:", error);
    return [];
  }
}

// Get a specific service variant by ID
export async function getServiceVariantById(variantId: string): Promise<ServiceVariant | null> {
  try {
    const { data, error } = await supabase
      .from("service_variants")
      .select("*")
      .eq("id", variantId)
      .single();
    
    if (error || !data) {
      console.error("Error fetching service variant by ID:", error);
      return null;
    }
    
    return data as ServiceVariant;
  } catch (error) {
    console.error("Error in getServiceVariantById:", error);
    return null;
  }
}

// Get service with its variants (for detailed service pages)
export async function getServiceWithVariants(serviceId: string): Promise<{ service: Service | null; variants: ServiceVariant[] }> {
  try {
    const [service, variants] = await Promise.all([
      getServiceById(serviceId),
      getServiceVariants(serviceId)
    ]);
    
    return { service, variants };
  } catch (error) {
    console.error("Error in getServiceWithVariants:", error);
    return { service: null, variants: [] };
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

// For admin use - create a new service variant
export async function createServiceVariant(variant: Omit<ServiceVariant, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("service_variants")
      .insert(variant)
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

// For admin use - update an existing service variant
export async function updateServiceVariant(id: string, updates: Partial<Omit<ServiceVariant, "id" | "created_at" | "updated_at">>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("service_variants")
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

// For admin use - delete a service variant
export async function deleteServiceVariant(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("service_variants")
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