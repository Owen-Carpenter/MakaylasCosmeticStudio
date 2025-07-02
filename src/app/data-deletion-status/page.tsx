"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function DataDeletionStatusPage() {
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Data Deletion Request Processed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {code && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Confirmation Code:</strong> {code}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Your data deletion request has been successfully processed. All your personal data 
                  associated with your Facebook account has been removed from our systems.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">What has been deleted:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your profile information</li>
                    <li>• All booking history and appointments</li>
                    <li>• Account preferences and settings</li>
                    <li>• Any uploaded photos or files</li>
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">
                      If you have any questions, contact us at:{" "}
                      <a 
                        href="mailto:makaylascosmeticstudio@gmail.com" 
                        className="text-primary hover:underline"
                      >
                        makaylascosmeticstudio@gmail.com
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 