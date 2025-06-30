export const seoConfig = {
  // Site Information
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Makayla's Cosmetic Studio",
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Premium eyelash extensions and beauty services with exceptional quality and personalized care',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://makaylascosmeticstudio.com',
  
  // Business Information
  business: {
    name: process.env.BUSINESS_NAME || "Makayla's Cosmetic Studio",
    address: process.env.BUSINESS_ADDRESS || 'Conway, Arkansas 72032',
    phone: process.env.BUSINESS_PHONE || '+1-501-555-0123',
    email: process.env.BUSINESS_EMAIL || 'makaylascosmeticstudio@gmail.com',
  },
  
  // Social Media
  social: {
    twitter: process.env.TWITTER_HANDLE || '@makaylascosmetics',
    facebook: `https://facebook.com/${process.env.FACEBOOK_PAGE_ID || 'makaylascosmeticstudio'}`,
    linkedin: `https://linkedin.com/company/${process.env.LINKEDIN_COMPANY_ID || 'makaylascosmeticstudio'}`,
    instagram: 'https://instagram.com/makaylascosmeticstudio',
  },
  
  // Default SEO Values
  defaultTitle: "Makayla's Cosmetic Studio - Premium Eyelash Extensions & Beauty Services",
  titleTemplate: "%s | Makayla's Cosmetic Studio",
  defaultDescription: 'Experience premium eyelash extensions and beauty treatments at Makayla\'s Cosmetic Studio. Professional classic, volume, hybrid, and wispy lash services with exceptional quality and personalized care.',
  defaultKeywords: [
    'eyelash extensions',
    'lash extensions',
    'classic lashes',
    'volume lashes',
    'hybrid lashes',
    'wispy lashes',
    'beauty services',
    'lash fills',
    'professional lash artist',
    'cosmetic studio',
    'beauty salon',
    'eyelash specialist'
  ],
  
  // Open Graph Defaults
  ogImage: '/images/mcstudioLogo.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  
  // Analytics
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID,
  facebookPixelId: process.env.FACEBOOK_PIXEL_ID,
  
  // Verification Codes
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.BING_SITE_VERIFICATION,
  
  // Service Categories with SEO-friendly names
  serviceCategories: {
    classic: {
      name: 'Classic Eyelash Extensions',
      description: 'Natural-looking classic eyelash extensions for everyday elegance',
      keywords: ['classic lashes', 'natural lashes', 'eyelash extensions', 'classic extensions']
    },
    volume: {
      name: 'Volume Eyelash Extensions',
      description: 'Dramatic volume lashes for bold and glamorous looks',
      keywords: ['volume lashes', 'dramatic lashes', 'full lashes', 'volume extensions']
    },
    hybrid: {
      name: 'Hybrid Eyelash Extensions',
      description: 'Perfect blend of classic and volume techniques for versatile looks',
      keywords: ['hybrid lashes', 'mixed lashes', 'versatile lashes', 'hybrid extensions']
    },
    wispy: {
      name: 'Wispy Eyelash Extensions',
      description: 'Textured wispy lashes for a natural yet enhanced appearance',
      keywords: ['wispy lashes', 'textured lashes', 'natural volume', 'wispy extensions']
    },
    fills: {
      name: 'Eyelash Extension Fills',
      description: 'Professional lash fills to maintain your beautiful extensions',
      keywords: ['lash fills', 'extension maintenance', 'lash touch-ups', 'fill appointments']
    }
  },
  
  // FAQ Schema Data
  commonFAQs: [
    {
      question: "How do I book an eyelash extension appointment at Makayla's Cosmetic Studio?",
      answer: "Booking is easy! Browse our eyelash extension services, select the style you want (classic, volume, hybrid, or wispy), choose your preferred date and time, and complete the booking process. You'll receive a confirmation email with all the details."
    },
    {
      question: "How long do eyelash extensions last?",
      answer: "Eyelash extensions typically last 2-3 weeks with proper care. We recommend fill appointments every 1-3 weeks depending on your natural lash cycle and desired fullness to maintain the best look."
    },
    {
      question: "What's the difference between classic, volume, and hybrid lashes?",
      answer: "Classic lashes provide a natural look with one extension per natural lash. Volume lashes use multiple lightweight extensions for dramatic fullness. Hybrid combines both techniques for a versatile, textured appearance."
    },
    {
      question: "Can I reschedule or cancel my lash appointment?",
      answer: "Yes, you can reschedule or cancel your appointment up to 24 hours before the scheduled time without any charge. Please contact us or use your account dashboard to make changes."
    }
  ],
  
  // Structured Data Templates
  organization: {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "Makayla's Cosmetic Studio",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://makaylascosmeticstudio.com',
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://makaylascosmeticstudio.com'}/images/mcstudioLogo.png`,
    "sameAs": [
      "https://facebook.com/makaylascosmeticstudio",
      "https://twitter.com/makaylascosmetics",
      "https://linkedin.com/company/makaylascosmeticstudio",
      "https://instagram.com/makaylascosmeticstudio"
    ]
  }
};

// Helper function to get category SEO data
export function getCategorySEOData(category: string) {
  return seoConfig.serviceCategories[category as keyof typeof seoConfig.serviceCategories] || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Professional ${category} services`,
    keywords: [category, 'professional service', 'service booking']
  };
}

// Helper function to generate page title
export function generatePageTitle(title: string, includeTemplate = true) {
  if (includeTemplate && !title.includes("Makayla's Cosmetic Studio")) {
    return `${title} | ${seoConfig.siteName}`;
  }
  return title;
}

// Helper function to truncate description
export function truncateDescription(text: string, maxLength = 160) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
} 