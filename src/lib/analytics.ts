// Analytics tracking utilities

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track service booking
export const trackServiceBooking = (serviceId: string, serviceName: string, price: number) => {
  trackEvent('book_service', 'booking', serviceName, price);
  
  // Enhanced ecommerce tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `booking_${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [
        {
          item_id: serviceId,
          item_name: serviceName,
          category: 'service',
          quantity: 1,
          price: price,
        },
      ],
    });
  }
};

// Track service view
export const trackServiceView = (serviceId: string, serviceName: string, category: string) => {
  trackEvent('view_service', 'engagement', serviceName);
  
  // Enhanced ecommerce tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: 0,
      items: [
        {
          item_id: serviceId,
          item_name: serviceName,
          category: category,
        },
      ],
    });
  }
};

// Track user registration
export const trackUserRegistration = (method: string = 'email') => {
  trackEvent('sign_up', 'user', method);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
    });
  }
};

// Track user login
export const trackUserLogin = (method: string = 'email') => {
  trackEvent('login', 'user', method);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
    });
  }
};

// Track search
export const trackSearch = (searchTerm: string, category?: string) => {
  trackEvent('search', 'engagement', searchTerm);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      content_category: category,
    });
  }
};

// Track page view (for SPA navigation)
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_location: url,
      page_title: title,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', 'form', formName);
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', 'engagement', `${buttonName}_${location}`);
};

// Track file downloads
export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', 'engagement', fileName);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'file_download', {
      file_name: fileName,
      file_extension: fileType,
    });
  }
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText: string) => {
  trackEvent('external_link_click', 'engagement', linkText);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      link_url: url,
      link_text: linkText,
      outbound: true,
    });
  }
}; 