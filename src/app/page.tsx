"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Mail, Phone, Clock, DollarSign, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { initScrollAnimations } from "@/lib/scroll-animations";
import { Service } from "@/lib/services";
import { getServices } from "@/lib/supabase-services";
import { Footer } from "@/components/ui/footer";
import dynamic from "next/dynamic";

// Dynamically import the eyelash 3D models to avoid SSR issues
const CosmeticModel = dynamic(() => import("@/components/3d/EyeLashModels"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-white/80 text-sm">Loading Eyelash Models...</p>
      </div>
    </div>
  )
});

// Format category name for display
const formatCategoryName = (category: string) => {
  if (category === "all") return "All Services";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function HomePage() {
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState({ type: '', text: '' });

  // Initialize scroll animations
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

  // Fetch popular services
  useEffect(() => {
    async function fetchPopularServices() {
      setLoading(true);
      try {
        const services = await getServices();
        // Get first 3 services as popular services
        setPopularServices(services.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    }
    
    fetchPopularServices();
  }, []);

  // Handle contact form input changes
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const result = await response.json();

      if (result.success) {
        setContactMessage({ type: 'success', text: result.message });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setContactMessage({ 
        type: 'error', 
        text: 'Failed to send message. Please try again later.' 
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-24 gradient-bg text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-yellow-400 rounded-full animate-pulse max-md:w-40 max-md:h-40 max-md:-top-10 max-md:-left-10 shadow-[0_0_100px_rgba(251,191,36,0.6)] blur-sm"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-400 rounded-full animate-pulse delay-300 max-md:w-20 max-md:h-20 max-md:top-20 max-md:right-10 shadow-[0_0_80px_rgba(251,191,36,0.5)] blur-sm"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse delay-200 max-md:w-12 max-md:h-12 shadow-[0_0_60px_rgba(251,191,36,0.4)] blur-sm"></div>
          <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-yellow-400 rounded-full animate-pulse delay-400 max-md:w-16 max-md:h-16 max-md:-bottom-5 shadow-[0_0_70px_rgba(251,191,36,0.5)] blur-sm"></div>
        </div>
        <div className="content-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight animate-fadeInLeft">
              <span className="block text-white drop-shadow-lg filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Start Your</span>
              <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent font-black tracking-tight filter drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]">
                Cosmetic Journey
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-md animate-fadeInLeft delay-200">
              Makayla&apos;s Cosmetic Studio offers premium beauty services with professional appointment booking, payments, and customer care through our modern platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInLeft delay-300">
              <Link href="/services">
                <Button size="lg" className="servify-btn-secondary hover-scale w-full sm:w-auto shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all duration-300">Browse Services</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" className="servify-btn-primary hover-glow w-full sm:w-auto shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300">Create Account</Button>
              </Link>
            </div>
          </div>
          <div className="relative animate-fadeInRight h-[280px] md:h-[450px]">
            <CosmeticModel />
          </div>
        </div>
        <div className="wave-shape">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <div className="mb-8">
              <Image 
                src="/images/MakaylaProfilePhoto.jpg" 
                alt="Makayla - Professional Esthetician" 
                width={128}
                height={128}
                className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg border-4 border-primary/20"
              />
            </div>
            <h2 className="text-4xl font-bold mb-4 gradient-text">About Makayla&apos;s Cosmetic Studio</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Located in Conway, Arkansas, we specialize in professional esthetician services including lash extensions, brow shaping, waxing, facials, and skin care treatments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg card-hover reveal-left hover:shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-primary/20 to-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <svg className="h-8 w-8 text-primary animate-pulse filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Lash & Brow Services</h3>
              <p className="text-slate-600">
                Professional lash extensions and precision brow shaping to frame your eyes beautifully and enhance your natural features.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg card-hover reveal delay-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_30px_rgba(236,72,153,0.2)] transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <svg className="h-8 w-8 text-pink-600 animate-pulse filter drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Skin Care</h3>
              <p className="text-slate-600">
                Customized facial treatments and skin care solutions tailored to your unique skin type and concerns for optimal results.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg card-hover reveal-right hover:shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_30px_rgba(34,197,94,0.2)] transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <MapPin className="h-8 w-8 text-green-600 animate-pulse filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Conway Location</h3>
              <p className="text-slate-600">
                Conveniently located at 278 U.S. 65 Suite C, Conway, AR 72032, serving the Conway community with premium beauty services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Preview Section */}
      <section id="popular-services" className="relative py-32 gradient-bg text-white">
        {/* Top wave shape */}
        <div className="wave-shape-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
        
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 text-white">Popular Services</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Book appointments for a wide range of professional services with our easy-to-use platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex justify-center items-center py-20">
                <div className="text-white text-lg">Loading services...</div>
              </div>
            ) : popularServices.length > 0 ? (
              popularServices.map((service, index) => (
                <Link href={`/services/${service.id}`} key={service.id} className="transition-transform hover:scale-[1.02] duration-300">
                  <Card className="h-full overflow-hidden transition-all duration-300
                    border border-white/20 shadow-xl
                    bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md
                    hover:shadow-[0_10px_40px_rgba(255,255,255,0.15)] hover:border-white/30 relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-[250px] font-bold opacity-[0.15] pointer-events-none select-none z-0 animate-float-slow bg-clip-text text-transparent bg-gradient-to-br from-white to-white/30" style={{ '--rotation': `${(index % 3) - 1}deg` } as React.CSSProperties}>
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl text-primary font-bold group-hover:text-primary/80 transition-colors">{service.title}</CardTitle>
                          <CardDescription className="mt-1 text-white/80 line-clamp-2">{service.details}</CardDescription>
                        </div>
                        <span className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white whitespace-nowrap flex-shrink-0 border border-white/10">
                          {formatCategoryName(service.category)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex justify-between text-sm text-white/70 mt-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-white/90" />
                          <span>{service.time}</span>
                        </div>
                        <div className="flex items-center font-medium">
                          <DollarSign className="h-4 w-4 mr-1 text-accent group-hover:text-accent/80 transition-colors" />
                          <span className="text-accent group-hover:text-accent/80 transition-colors">{service.price}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 pt-4 relative z-10">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white 
                        backdrop-blur-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02]">
                        <span>Book Now</span>
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-lg">No services available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center reveal">
            <Button 
              className="mt-6 servify-btn-secondary hover-glow"
              asChild
            >
              <Link href="/services">
                View All Services
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Bottom wave shape */}
        <div className="wave-shape">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 gradient-text">What Our Clients Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hear from customers who have experienced our exceptional beauty services at Makayla&apos;s Cosmetic Studio.
            </p>
          </div>
          
          <div className="relative px-4 md:px-12 reveal-scale">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="bg-white p-6 md:p-8 rounded-2xl shadow-lg h-full card-hover hover:shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_25px_rgba(251,191,36,0.2)] transition-all duration-300 border border-gray-100">
                        <CardContent className="p-0">
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                            ))}
                          </div>
                          <p className="text-slate-600 italic mb-6 text-sm md:text-base">&quot;{testimonial.quote}&quot;</p>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white mr-4 hover-rotate shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                              <span className="font-bold filter drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">{testimonial.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm md:text-base">{testimonial.name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-4 bg-white hover-scale" />
              <CarouselNext className="right-0 md:-right-4 bg-white hover-scale" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 pb-24 gradient-bg text-white relative">
        {/* Top wave shape */}
        <div className="wave-shape-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>

        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-60 h-60 bg-yellow-400 rounded-full animate-pulse max-md:w-30 max-md:h-30 max-md:top-10 max-md:left-10 shadow-[0_0_120px_rgba(251,191,36,0.6)] blur-sm"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-yellow-400 rounded-full animate-pulse delay-300 max-md:w-20 max-md:h-20 max-md:bottom-20 max-md:right-10 shadow-[0_0_100px_rgba(251,191,36,0.5)] blur-sm"></div>
        </div>
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Have questions about our platform? We&apos;re here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-8">
                <div className="flex items-center reveal-left">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                    <MapPin className="h-8 w-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Our Location</h3>
                    <p className="text-white/80 text-sm md:text-base">278 U.S. 65 Suite C, Conway, AR 72032</p>
                  </div>
                </div>
                
                <div className="flex items-center reveal-left delay-200">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                    <Mail className="h-8 w-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Email Us</h3>
                    <p className="text-white/80 text-sm md:text-base">makaylascosmeticstudio@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center reveal-left delay-300">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                    <Phone className="h-8 w-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Call Us</h3>
                    <p className="text-white/80 text-sm md:text-base">(501) 575-7209</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 reveal-right">
              <Card className="bg-white/10 backdrop-blur-sm border-white/10 hover-glow shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300">
                <CardContent className="p-6 md:p-8">
                  {contactMessage.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                      contactMessage.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
                        : 'bg-red-500/20 border border-red-500/30 text-red-100'
                    }`}>
                      {contactMessage.text}
                    </div>
                  )}
                  <form className="space-y-6" onSubmit={handleContactSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright text-sm"
                          placeholder="Your name"
                          value={contactForm.name}
                          onChange={handleContactInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright text-sm"
                          placeholder="Your email"
                          value={contactForm.email}
                          onChange={handleContactInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright text-sm"
                        placeholder="Subject"
                        value={contactForm.subject}
                        onChange={handleContactInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright text-sm resize-none"
                        placeholder="Your message"
                        value={contactForm.message}
                        onChange={handleContactInputChange}
                      ></textarea>
                    </div>
                    <Button 
                      className="w-full servify-btn-primary"
                      type="submit"
                      disabled={isSubmittingContact}
                    >
                      {isSubmittingContact ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Sample testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    quote: "Makayla's Cosmetic Studio completely transformed my beauty routine. The quality of service is exceptional and I feel pampered every visit!"
  },
  {
    name: "Ashley Martinez",
    quote: "My lash extensions look absolutely stunning! Makayla's attention to detail is incredible and they last so much longer than other places I've tried."
  },
  {
    name: "Jessica Thompson",
    quote: "Makayla did my wedding makeup and brows - I felt like a princess! The booking system made it so easy to schedule my trial and wedding day appointments."
  },
  {
    name: "Emily Wilson",
    quote: "As someone who values quality beauty treatments, Makayla's Cosmetic Studio delivers exactly what I need - professional service and amazing results."
  },
  {
    name: "Rachel Davis",
    quote: "The customized facial treatments have completely improved my skin! Makayla really knows how to address specific skin concerns with professional care."
  },
  {
    name: "Morgan Clark",
    quote: "Finally found someone who can shape my brows perfectly! The precision and technique at Makayla's studio is unmatched in Conway."
  }
];
