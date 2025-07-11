import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-yellow-50 to-amber-50 text-gray-800 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
      </div>
      
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">Makayla&apos;s Cosmetic Studio</h3>
                          <p className="text-gray-600 mb-4">
                Premium beauty treatments and cosmetic services.
              </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/makaylascosmeticstudio/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent transition-colors duration-300 hover:scale-105 transition-transform" aria-label="Visit Makayla's Cosmetic Studio on Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/makaylas_cosmetic_studio/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent transition-colors duration-300 hover:scale-105 transition-transform" aria-label="Visit Makayla's Cosmetic Studio on Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services?category=lashes" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Lashes & Brows</Link></li>
              <li><Link href="/services?category=facials" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Facials</Link></li>
              <li><Link href="/services?category=waxing" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Waxing</Link></li>
              <li><Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">All Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/#about" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">About Us</Link></li>
              <li><Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Reviews</Link></li>
              <li><Link href="/#contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Contact</Link></li>
              <li><Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 transition-transform inline-block">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600">
                        <p className="mb-2">© {new Date().getFullYear()} Makayla&apos;s Cosmetic Studio. All rights reserved.</p>
          <p className="text-sm text-gray-500">Developed by Owen Carpenter</p>
        </div>
      </div>
    </footer>
  );
} 