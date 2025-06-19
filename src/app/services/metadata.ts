import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Services - Book Quality Service Providers',
  description: 'Browse and book professional services including business consulting, beauty treatments, home maintenance, and more. Trusted providers with quality guaranteed.',
  keywords: [
    'professional services',
    'service booking',
    'business consulting',
    'beauty services',
    'home maintenance',
    'service providers',
    'quality services',
    'trusted professionals'
  ],
  openGraph: {
    title: 'Professional Services - Book Quality Service Providers',
    description: 'Browse and book professional services with trusted providers. Quality guaranteed.',
    url: '/services',
    images: [
      {
        url: '/images/services-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional Services Available on Servify',
      }
    ],
  },
  twitter: {
    title: 'Professional Services - Book Quality Service Providers',
    description: 'Browse and book professional services with trusted providers.',
    images: ['/images/services-og.jpg'],
  },
  alternates: {
    canonical: '/services',
  },
}; 