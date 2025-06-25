import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceById, getServices } from '@/lib/supabase-services';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import ServiceDetailClient from './ServiceDetailClient';

interface ServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  
  if (!service) {
    return {
      title: 'Service Not Found',
      description: 'The requested service could not be found.',
    };
  }

  const categoryNames: Record<string, string> = {
    consulting: 'Business Consulting',
    beauty: 'Beauty Services',
    maintenance: 'Home Maintenance',
    health: 'Health Services',
    education: 'Educational Services'
  };

  const categoryName = categoryNames[service.category] || service.category;
  const title = `${service.title} - ${categoryName} Service`;
  const description = `Book ${service.title} service for $${service.price}. ${service.details.substring(0, 150)}...`;

  return {
    title,
    description,
    keywords: [
      service.title.toLowerCase(),
      service.category,
      'professional service',
      'service booking',
      `${service.category} service`,
      'trusted provider',
      'quality service'
    ],
    openGraph: {
      title,
      description,
      url: `/services/${id}`,
      type: 'article',
      images: [
        {
          url: `/images/services/${service.category}.jpg`,
          width: 1200,
          height: 630,
          alt: `${service.title} - Professional Service`,
        }
      ],
    },
    twitter: {
      title,
      description,
      images: [`/images/services/${service.category}.jpg`],
    },
    alternates: {
      canonical: `/services/${id}`,
    },
  };
}

// Generate static params for static generation
export async function generateStaticParams() {
  const services = await getServices();
  
  return services.map((service) => ({
    id: service.id,
  }));
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  // Generate structured data
  const serviceSchema = generateServiceSchema(service);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: `/services/${id}` }
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      <ServiceDetailClient service={service} />
    </>
  );
} 