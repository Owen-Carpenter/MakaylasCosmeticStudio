import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Eyelash Extensions & Beauty Services - Makayla\'s Cosmetic Studio',
  description: 'Discover premium eyelash extension services at Makayla\'s Cosmetic Studio in Conway, Arkansas. Classic, volume, hybrid, and wispy lash extensions plus professional beauty treatments with expert care.',
  keywords: [
    'eyelash extensions Conway Arkansas',
    'lash extensions',
    'classic lashes',
    'volume lashes',
    'hybrid lashes',
    'wispy lashes',
    'professional lash artist',
    'beauty services Conway',
    'cosmetic studio',
    'lash fills',
    'Arkansas beauty salon',
    'premium lash services'
  ],
  openGraph: {
    title: 'Premium Eyelash Extensions & Beauty Services - Makayla\'s Cosmetic Studio',
    description: 'Discover premium eyelash extension services in Conway, Arkansas. Classic, volume, hybrid, and wispy lash extensions with expert care.',
    url: '/services',
    images: [
      {
        url: '/images/mcstudioLogo.png',
        width: 1200,
        height: 630,
        alt: 'Makayla\'s Cosmetic Studio - Premium Eyelash Extensions & Beauty Services',
      }
    ],
  },
  twitter: {
    title: 'Premium Eyelash Extensions & Beauty Services - Makayla\'s Cosmetic Studio',
    description: 'Discover premium eyelash extension services in Conway, Arkansas with expert care.',
    images: ['/images/mcstudioLogo.png'],
  },
  alternates: {
    canonical: '/services',
  },
}; 