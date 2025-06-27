"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
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
              Cookie Policy
            </CardTitle>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the website owners about how users interact with their sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Makayla&apos;s Cosmetic Studio uses cookies to enhance your browsing experience, provide personalized content, and analyze website performance. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To remember your preferences and settings</li>
                <li>To keep you logged into your account</li>
                <li>To provide secure access to our services</li>
                <li>To analyze website usage and improve our services</li>
                <li>To deliver personalized content and advertisements</li>
                <li>To prevent fraud and enhance security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Essential Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Authentication cookies (keep you logged in)</li>
                    <li>Security cookies (prevent fraudulent activity)</li>
                    <li>Session cookies (maintain your session state)</li>
                    <li>Load balancing cookies (distribute traffic)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Performance and Analytics Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    These cookies help us understand how visitors interact with our website by collecting anonymous information about usage patterns.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Google Analytics cookies</li>
                    <li>Page view tracking cookies</li>
                    <li>Error tracking cookies</li>
                    <li>Performance monitoring cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Functional Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    These cookies allow us to remember choices you make and provide enhanced, more personalized features.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Language preference cookies</li>
                    <li>Theme and display preference cookies</li>
                    <li>Location-based service cookies</li>
                    <li>Form data saving cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Marketing and Advertising Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    These cookies are used to deliver advertisements that are more relevant to you and your interests.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Social media integration cookies</li>
                    <li>Advertising network cookies</li>
                    <li>Retargeting cookies</li>
                    <li>Conversion tracking cookies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may also use third-party cookies from trusted partners to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Payment Processors:</strong> For secure payment processing (Stripe, PayPal)</li>
                <li><strong>Social Media:</strong> For social sharing and login functionality</li>
                <li><strong>Customer Support:</strong> For chat support and help desk services</li>
                <li><strong>Email Marketing:</strong> For email campaign tracking and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have several options for managing cookies:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. Here&apos;s how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Cookie Preferences Center</h3>
              <p className="text-gray-700 leading-relaxed">
                You can also manage your cookie preferences through our cookie preference center, which allows you to enable or disable different categories of cookies while maintaining essential functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies have different lifespans:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain until they expire or you delete them</li>
                <li><strong>Analytics Cookies:</strong> Typically expire after 2 years</li>
                <li><strong>Marketing Cookies:</strong> May last from 30 days to 2 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Impact of Disabling Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you choose to disable cookies, some features of our website may not function properly:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You may need to log in repeatedly</li>
                <li>Your preferences and settings won&apos;t be saved</li>
                <li>Some personalized features may not work</li>
                <li>Website performance may be slower</li>
                <li>You may see less relevant advertisements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, please get in touch with us.
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