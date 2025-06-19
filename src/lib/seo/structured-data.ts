import { Service } from '@/lib/services';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servify.com';

// Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Servify",
    "description": "Premium Service Marketplace - Connect with trusted service providers for all your needs",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "Customer Service",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "Your City",
      "addressRegion": "Your State"
    },
    "sameAs": [
      "https://facebook.com/servify",
      "https://twitter.com/servify",
      "https://linkedin.com/company/servify"
    ]
  };
}

// Website Schema
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Servify",
    "url": baseUrl,
    "description": "Premium Service Marketplace - Connect with trusted service providers for all your needs",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/services?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// Service Schema
export function generateServiceSchema(service: Service) {
  const categoryMap: Record<string, string> = {
    consulting: 'Business Consulting',
    beauty: 'Beauty Services',
    maintenance: 'Home Maintenance',
    health: 'Health Services',
    education: 'Educational Services'
  };

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.details,
    "category": categoryMap[service.category] || service.category,
    "provider": {
      "@type": "Organization",
      "name": "Servify"
    },
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    },
    "serviceType": service.category,
    "url": `${baseUrl}/services/${service.id}`,
    "duration": service.time
  };
}

// Local Business Schema (for service providers)
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Servify",
    "description": "Premium Service Marketplace offering professional services",
    "url": baseUrl,
    "telephone": "+1-555-0123",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Service Street",
      "addressLocality": "Your City",
      "addressRegion": "Your State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-16:00"
    ],
    "priceRange": "$49-$179",
    "servedCuisine": [], // Not applicable for services
    "hasMenu": false,
    "acceptsReservations": true
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `${baseUrl}${breadcrumb.url}`
    }))
  };
}

// FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Article Schema (for blog posts or guides)
export function generateArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  author,
  url,
  image
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Servify",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "url": `${baseUrl}${url}`,
    "image": image ? `${baseUrl}${image}` : `${baseUrl}/images/og-default.jpg`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}${url}`
    }
  };
}

// Review Schema
export function generateReviewSchema({
  itemName,
  rating,
  reviewBody,
  author,
  datePublished
}: {
  itemName: string;
  rating: number;
  reviewBody: string;
  author: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Service",
      "name": itemName
    },
    "author": {
      "@type": "Person",
      "name": author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": rating,
      "bestRating": 5
    },
    "reviewBody": reviewBody,
    "datePublished": datePublished
  };
} 