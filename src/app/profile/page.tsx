"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ExtendedUser } from "@/types/next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { PageLoader } from "@/components/ui/page-loader";

interface UserProfileData {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: null,
    email: null,
    phone: null
  });
  const [editData, setEditData] = useState<UserProfileData>({
    name: null,
    email: null,
    phone: null
  });

  const user = session?.user as ExtendedUser;

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setProfileData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone
        });
        setEditData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone
        });
      } else {
        throw new Error(data.message || "Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && user) {
      // Initialize with session data first
      setProfileData({
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null
      });
      setEditData({
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null
      });
      
      // Then fetch the latest data from the API
      fetchProfileData();
    }
  }, [status, user, fetchProfileData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(profileData); // Reset to current profile data
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Create update data object, preserving existing values if not changed
      const updateData = {
        name: editData.name,
        phone: editData.phone,
      };
      
      console.log("Sending update data:", updateData);
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (data.success && data.user) {
        // Update all state with the response data
        const updatedUser = data.user;
        setProfileData({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        });
        setEditData({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        });
        
        // Update the session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedUser.name,
            phone: updatedUser.phone
          }
        });
        
        setIsEditing(false);
        toast.success("Profile updated successfully");
        
        // Verify the update by fetching fresh data
        await fetchProfileData();
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <PageLoader 
        message="Loading Profile" 
        subMessage="Please wait while we fetch your profile information..." 
      />
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content with Gradient Background */}
      <main className="flex-grow pt-24 pb-20 gradient-bg relative">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-white rounded-full animate-pulse delay-400"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-8 text-white">Profile Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Profile Information */}
            <Card className="col-span-2 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  {isEditing ? (
                    <Input
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter your name"
                      className="bg-white/50"
                    />
                  ) : (
                    <p className="text-gray-700">{profileData.name || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-700">{profileData.email || "Not set"}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editData.phone || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Enter your phone number"
                      className="bg-white/50"
                    />
                  ) : (
                    <p className="text-gray-700">{profileData.phone || "Not set"}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleEdit}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Type</label>
                  <p className="text-gray-700 capitalize">{session?.user?.role || "User"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Since</label>
                  <p className="text-gray-700">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : "Not available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Border with footer */}
        <div className="border-t border-white/10 mt-auto"></div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 