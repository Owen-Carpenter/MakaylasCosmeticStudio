export const seoConfig = {
  // Site Information
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Servify',
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Premium Service Marketplace - Connect with trusted service providers for all your needs',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://servify.com',
  
  // Business Information
  business: {
    name: process.env.BUSINESS_NAME || 'Servify',
    address: process.env.BUSINESS_ADDRESS || '123 Service Street, Your City, State 12345',
    phone: process.env.BUSINESS_PHONE || '+1-555-0123',
    email: process.env.BUSINESS_EMAIL || 'info@servify.com',
  },
  
  // Social Media
  social: {
    twitter: process.env.TWITTER_HANDLE || '@servify',
    facebook: `https://facebook.com/${process.env.FACEBOOK_PAGE_ID || 'servify'}`,
    linkedin: `https://linkedin.com/company/${process.env.LINKEDIN_COMPANY_ID || 'servify'}`,
    instagram: 'https://instagram.com/servify',
  },
  
  // Default SEO Values
  defaultTitle: 'Servify - Premium Service Marketplace',
  titleTemplate: '%s | Servify',
  defaultDescription: 'Connect with trusted service providers for all your needs. Book professional services including consulting, beauty, maintenance, and more. Quality guaranteed.',
  defaultKeywords: [
    'service marketplace',
    'professional services',
    'booking platform',
    'trusted providers',
    'consulting services',
    'beauty services',
    'home maintenance',
    'service booking',
    'quality services',
    'licensed professionals'
  ],
  
  // Open Graph Defaults
  ogImage: '/images/og-default.jpg',
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
    consulting: {
      name: 'Business Consulting',
      description: 'Professional business consulting services to help grow your business',
      keywords: ['business consulting', 'business advice', 'strategic planning', 'business growth']
    },
    beauty: {
      name: 'Beauty Services',
      description: 'Professional beauty and wellness services for your personal care',
      keywords: ['beauty services', 'hair styling', 'facial treatments', 'massage therapy', 'wellness']
    },
    maintenance: {
      name: 'Home Maintenance',
      description: 'Reliable home maintenance and repair services for your property',
      keywords: ['home maintenance', 'home repair', 'plumbing', 'electrical', 'handyman services']
    },
    health: {
      name: 'Health Services',
      description: 'Professional health and medical services for your wellbeing',
      keywords: ['health services', 'medical consultation', 'healthcare', 'wellness']
    },
    education: {
      name: 'Educational Services',
      description: 'Quality educational and training services for personal development',
      keywords: ['education services', 'tutoring', 'training', 'learning', 'skill development']
    }
  },
  
  // FAQ Schema Data
  commonFAQs: [
    {
      question: "How do I book a service on Servify?",
      answer: "Booking a service is easy! Browse our services, select the one you need, choose your preferred date and time, and complete the booking process. You'll receive a confirmation email with all the details."
    },
    {
      question: "Are all service providers on Servify licensed and insured?",
      answer: "Yes, all our service providers are fully licensed, insured, and have undergone thorough background checks. We only work with experienced professionals who meet our high quality standards."
    },
    {
      question: "What payment methods does Servify accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely at the time of booking to confirm your appointment."
    },
    {
      question: "Can I reschedule or cancel my appointment?",
      answer: "Yes, you can reschedule or cancel your appointment up to 24 hours before the scheduled time without any charge. Please contact our customer service or use your account dashboard."
    }
  ],
  
  // Structured Data Templates
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Servify",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://servify.com',
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://servify.com'}/images/logo.png`,
    "sameAs": [
      "https://facebook.com/servify",
      "https://twitter.com/servify",
      "https://linkedin.com/company/servify",
      "https://instagram.com/servify"
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
  if (includeTemplate && !title.includes('Servify')) {
    return `${title} | ${seoConfig.siteName}`;
  }
  return title;
}

// Helper function to truncate description
export function truncateDescription(text: string, maxLength = 160) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
} 