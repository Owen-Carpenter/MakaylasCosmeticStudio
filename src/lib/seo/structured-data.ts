import { Service } from '@/lib/services';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://makaylascosmeticstudio.com';

// Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "Makayla's Cosmetic Studio",
    "description": "Premium eyelash extensions and beauty services with exceptional quality and personalized care",
    "url": baseUrl,
    "logo": `${baseUrl}/images/mcstudioLogo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-501-575-7209",
      "contactType": "Customer Service",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "Conway",
      "addressRegion": "Arkansas",
      "postalCode": "72032"
    },
    "sameAs": [
      "https://facebook.com/makaylascosmeticstudio",
      "https://twitter.com/makaylascosmetics",
      "https://linkedin.com/company/makaylascosmeticstudio",
      "https://instagram.com/makaylascosmeticstudio"
    ]
  };
}

// Website Schema
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Makayla's Cosmetic Studio",
    "url": baseUrl,
    "description": "Premium eyelash extensions and beauty services with exceptional quality and personalized care",
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
    classic: 'Classic Eyelash Extensions',
    volume: 'Volume Eyelash Extensions',
    hybrid: 'Hybrid Eyelash Extensions',
    wispy: 'Wispy Eyelash Extensions',
    angel: 'Angel/Wet Eyelash Extensions',
    beauty: 'Beauty Services'
  };

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.details,
    "category": categoryMap[service.category] || service.category,
    "provider": {
      "@type": "BeautySalon",
      "name": "Makayla's Cosmetic Studio"
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
    "@type": "BeautySalon",
    "name": "Makayla's Cosmetic Studio",
    "description": "Premium eyelash extensions and beauty services with exceptional quality and personalized care",
    "url": baseUrl,
    "telephone": "+1-501-575-7209",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Conway",
      "addressRegion": "Arkansas",
      "postalCode": "72032",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "35.0887",
      "longitude": "-92.4421"
    },
    "openingHours": [
      "Mo-Th 06:00-20:00",
      "Fr 06:00-15:00",
      "Sa 06:00-13:00"
    ],
    "priceRange": "$40-$140",
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
      "name": "Makayla's Cosmetic Studio",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/mcstudioLogo.png`
      }
    },
    "url": `${baseUrl}${url}`,
    "image": image ? `${baseUrl}${image}` : `${baseUrl}/images/mcstudioLogo.png`,
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