import { MetadataRoute } from 'next';
import { getServices } from '@/lib/supabase-services';
import { Service } from '@/lib/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servify.com';
  
  // Get all services for dynamic routes with error handling
  let services: Service[] = [];
  try {
    services = await getServices();
  } catch (error) {
    console.error('Error fetching services for sitemap:', error);
    // Continue with empty services array if database fails
    services = [];
  }
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Service category routes
  const categories = [...new Set(services.map(service => service.category))];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/services?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Individual service routes
  const serviceRoutes: MetadataRoute.Sitemap = services.map(service => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...serviceRoutes];
} 