"use client";

/**
 * Scroll animation script
 * Handles revealing elements as they enter the viewport
 */

export function initScrollAnimations() {
  if (typeof window === 'undefined') return;
  
  // Get all elements that have animation classes
  const animatedElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  
  // Function to check if an element is in viewport
  const isInViewport = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
      rect.bottom >= 0
    );
  };
  
  // Function to handle scroll and reveal elements
  const handleScroll = (): void => {
    animatedElements.forEach((element) => {
      if (isInViewport(element)) {
        element.classList.add('active');
      }
    });
  };
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Trigger once on load
  setTimeout(handleScroll, 100);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
} 