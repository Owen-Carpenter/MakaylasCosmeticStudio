import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navigation } from "@/components/ui/navigation";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/structured-data";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: "Makayla's Cosmetic Studio - Premium Eyelash Extensions & Beauty Services",
    template: "%s | Makayla's Cosmetic Studio"
  },
  description: "Experience premium eyelash extensions and beauty treatments at Makayla's Cosmetic Studio. Professional classic, volume, hybrid, and wispy lash services with exceptional quality and personalized care.",
  keywords: [
    "eyelash extensions",
    "lash extensions", 
    "classic lashes",
    "volume lashes",
    "hybrid lashes",
    "wispy lashes",
    "beauty services",
    "lash fills",
    "professional lash artist",
    "cosmetic studio",
    "beauty salon",
    "eyelash specialist"
  ],
  authors: [{ name: "Makayla's Cosmetic Studio" }],
  creator: "Makayla's Cosmetic Studio",
  publisher: "Makayla's Cosmetic Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://makaylascosmeticstudio.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: "Makayla's Cosmetic Studio - Premium Eyelash Extensions & Beauty Services",
    description: 'Experience premium eyelash extensions and beauty treatments at Makayla\'s Cosmetic Studio. Professional classic, volume, hybrid, and wispy lash services with exceptional quality and personalized care.',
    siteName: "Makayla's Cosmetic Studio",
    images: [
      {
        url: '/images/mcstudioLogo.png',
        width: 1200,
        height: 630,
        alt: "Makayla's Cosmetic Studio - Premium Eyelash Extensions & Beauty Services",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Makayla's Cosmetic Studio - Premium Eyelash Extensions & Beauty Services",
    description: 'Experience premium eyelash extensions and beauty treatments with exceptional quality and personalized care.',
    images: ['/images/mcstudioLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  
  // Get analytics IDs from environment variables
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager */}
        {GTM_ID && <GoogleTagManager GTM_ID={GTM_ID} />}
        
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
        
        <SessionProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
