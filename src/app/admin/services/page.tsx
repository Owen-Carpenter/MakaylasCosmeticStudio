"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "@/lib/services";
import { getServices, createService, updateService, deleteService } from "@/lib/supabase-services";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Service, "id" | "created_at" | "updated_at">>({
    title: "",
    details: "",
    time: "",
    category: "",
    price: 0
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.push("/");
      toast.error("Unauthorized access. Admin privileges required.");
    }
  }, [session, router]);

  // Load services from Supabase
  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      const servicesData = await getServices();
      setServices(servicesData);
      setLoading(false);
    }

    loadServices();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; name: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    
    // Handle price as a number
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Start editing a service
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      details: service.details,
      time: service.time,
      category: service.category,
      price: service.price
    });
    setIsCreating(false);
  };

  // Start creating a new service
  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      title: "",
      details: "",
      time: "",
      category: "",
      price: 0
    });
    setIsCreating(true);
  };

  // Cancel editing/creating
  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
  };

  // Save the current service (create or update)
  const handleSave = async () => {
    // Validate form data
    if (!formData.title || !formData.details || !formData.time || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      if (isCreating) {
        // Create new service
        const result = await createService(formData);
        if (result.success) {
          toast.success("Service created successfully");
          // Refresh the service list
          const updatedServices = await getServices();
          setServices(updatedServices);
          setIsCreating(false);
        } else {
          toast.error(`Failed to create service: ${result.error}`);
        }
      } else if (editingService) {
        // Update existing service
        const result = await updateService(editingService.id, formData);
        if (result.success) {
          toast.success("Service updated successfully");
          // Refresh the service list
          const updatedServices = await getServices();
          setServices(updatedServices);
          setEditingService(null);
        } else {
          toast.error(`Failed to update service: ${result.error}`);
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the service");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a service
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteService(id);
      if (result.success) {
        toast.success("Service deleted successfully");
        // Remove the deleted service from the list
        setServices(services.filter(service => service.id !== id));
      } else {
        toast.error(`Failed to delete service: ${result.error}`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the service");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  // If user is not admin or session is loading, show nothing
  if (!session || (session && session.user.role !== "admin")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Button onClick={handleCreate} disabled={isCreating || !!editingService} className="flex items-center gap-2">
          <Plus size={16} /> Add New Service
        </Button>
      </div>

      {/* Edit/Create Form */}
      {(isCreating || editingService) && (
        <div className="bg-card p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {isCreating ? "Create New Service" : "Edit Service"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Service title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                name="category" 
                value={formData.category} 
                onValueChange={(value) => handleChange({ name: "category", value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                placeholder="e.g. 60 min, 2 hours"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="Price in USD"
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <Label htmlFor="details">Details</Label>
            <Textarea 
              id="details" 
              name="details" 
              value={formData.details} 
              onChange={handleChange} 
              placeholder="Detailed description of the service"
              rows={5}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-card rounded-lg shadow border">
        {loading && !isCreating && !editingService ? (
          <div className="p-8 text-center">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            No services found. Create your first service using the button above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3">{service.title}</td>
                    <td className="px-4 py-3 capitalize">{service.category}</td>
                    <td className="px-4 py-3">{service.time}</td>
                    <td className="px-4 py-3">${service.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(service)}
                          disabled={isCreating || !!editingService}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(service.id)}
                          disabled={isCreating || !!editingService}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 