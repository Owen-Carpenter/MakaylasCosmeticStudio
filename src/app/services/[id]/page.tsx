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
    classic: 'Classic Eyelash Extensions',
    volume: 'Volume Eyelash Extensions',
    hybrid: 'Hybrid Eyelash Extensions',
    wispy: 'Wispy Eyelash Extensions',
    angel: 'Angel/Wet Eyelash Extensions',
    beauty: 'Beauty Services',
    fills: 'Lash Extension Fills'
  };

  const categoryName = categoryNames[service.category] || service.category;
  const title = `${service.title} - ${categoryName} | Makayla's Cosmetic Studio`;
  const description = `Book ${service.title} at Makayla's Cosmetic Studio in Conway, Arkansas for $${service.price}. ${service.details.substring(0, 120)}... Professional eyelash extension services with expert care.`;

  return {
    title,
    description,
    keywords: [
      service.title.toLowerCase(),
      service.category,
      'eyelash extensions Conway Arkansas',
      'professional lash artist',
      'Makayla cosmetic studio',
      `${service.category} lashes`,
      'beauty services Conway',
      'lash extension appointment',
      'Arkansas lash studio'
    ],
    openGraph: {
      title,
      description,
      url: `/services/${id}`,
      type: 'article',
      siteName: 'Makayla\'s Cosmetic Studio',
      images: [
        {
          url: `/images/mcstudioLogo.png`,
          width: 1200,
          height: 630,
          alt: `${service.title} - Makayla's Cosmetic Studio`,
        }
      ],
    },
    twitter: {
      title,
      description,
      images: [`/images/mcstudioLogo.png`],
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