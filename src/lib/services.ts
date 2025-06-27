export interface Service {
  id: string;
  title: string;
  details: string;
  time: string;
  price: number;
  category: string;
  has_variants?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceVariant {
  id: string;
  service_id: string;
  variant_name: string;
  variant_description?: string;
  price: number;
  time: string;
  sort_order: number;
  requirements?: string;
  created_at?: string;
  updated_at?: string;
}

// Mock data for services
export const mockServices: Service[] = [
  {
    id: "1",
    title: "Business Consultation",
    details: "One-on-one consultation for your business needs. Our expert consultants will help you identify opportunities for growth, optimize operations, and develop strategic plans tailored to your business goals.",
    time: "60 min",
    price: 99,
    category: "consulting",
    has_variants: false
  },
  {
    id: "2",
    title: "Haircut & Styling",
    details: "Professional haircut and styling service. Our experienced stylists will provide a personalized experience, from consultation to finishing touches, ensuring you leave with a look that suits your style and personality.",
    time: "45 min",
    price: 49,
    category: "beauty",
    has_variants: false
  },
  {
    id: "3",
    title: "Home Repair",
    details: "General home repair and maintenance. Our skilled technicians can handle a wide range of repairs, from fixing leaky faucets to patching drywall, helping you maintain your home in top condition.",
    time: "120 min",
    price: 129,
    category: "maintenance",
    has_variants: false
  },
  {
    id: "4",
    title: "Legal Consultation",
    details: "Professional legal advice for various matters. Our attorneys provide clear guidance on legal issues affecting individuals and businesses, helping you navigate complex legal situations with confidence.",
    time: "90 min",
    price: 149,
    category: "consulting",
    has_variants: false
  },
  {
    id: "5",
    title: "Massage Therapy",
    details: "Relaxing full-body massage to relieve stress. Our certified massage therapists use various techniques to reduce muscle tension, improve circulation, and promote overall well-being.",
    time: "60 min",
    price: 79,
    category: "beauty",
    has_variants: false
  },
  {
    id: "6",
    title: "Plumbing Service",
    details: "Professional plumbing repair and installation. Our licensed plumbers can diagnose and fix issues with your plumbing system, install new fixtures, and provide preventative maintenance to avoid future problems.",
    time: "90 min",
    price: 109,
    category: "maintenance",
    has_variants: false
  },
  {
    id: "7",
    title: "Financial Planning",
    details: "Comprehensive financial planning and advice to secure your future. Our financial advisors help you create personalized strategies for retirement, investment, and saving goals.",
    time: "120 min",
    price: 179,
    category: "consulting",
    has_variants: false
  },
  {
    id: "8",
    title: "Facial Treatment",
    details: "Rejuvenating facial treatment for glowing skin. Our estheticians use premium products and techniques to cleanse, exfoliate, and hydrate your skin for a refreshed appearance.",
    time: "75 min",
    price: 89,
    category: "beauty",
    has_variants: false
  },
  {
    id: "9",
    title: "Electrical Repairs",
    details: "Professional electrical repair and installation services. Our licensed electricians can handle everything from wiring issues to installing new fixtures safely and efficiently.",
    time: "100 min",
    price: 119,
    category: "maintenance",
    has_variants: false
  }
]; 