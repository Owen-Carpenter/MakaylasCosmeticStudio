"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="content-container pt-24 pb-8">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 content-container pb-12">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Terms of Service
            </CardTitle>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Makayla&apos;s Cosmetic Studio&apos;s platform, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of Makayla&apos;s Cosmetic Studio&apos;s materials for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Booking and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you book a service through our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You agree to provide accurate and complete information</li>
                <li>Payment is required at the time of booking to confirm your appointment</li>
                <li>Cancellations must be made at least 24 hours in advance for a full refund</li>
                <li>No-shows may result in forfeiture of payment</li>
                <li>Service providers reserve the right to refuse service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Provider Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All service providers on our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                  <li>Are independent contractors, not employees of Makayla&apos;s Cosmetic Studio</li>
                <li>Are responsible for their own licensing, insurance, and tax obligations</li>
                <li>Must maintain professional standards and deliver services as advertised</li>
                <li>Are required to undergo background checks and verification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
                            <p className="text-gray-700 leading-relaxed">
                In no event shall Makayla&apos;s Cosmetic Studio or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
          or due to business interruption) arising out of the use or inability to use the materials on Makayla&apos;s Cosmetic Studio&apos;s website,
          even if Makayla&apos;s Cosmetic Studio or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] 
                and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                Makayla&apos;s Cosmetic Studio reserves the right to revise these terms of service at any time without notice. 
                By using this web site, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about these Terms of Service, please get in touch with us.
              </p>
              <div className="flex justify-center">
                <Link href="/#contact">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
} 