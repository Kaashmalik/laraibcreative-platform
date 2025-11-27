'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

/**
 * HeroSection Component
 * Full-screen animated hero with gradient background, tagline, and CTAs
 * Features:
 * - Animated gradient background
 * - Fade-in animations on mount
 * - Floating elements animation
 * - Responsive design
 * - Two primary CTAs
 */
export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Animated Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-rose-600/20 animate-gradient" />
      
      {/* Floating Decorative Elements - Reduced size on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 sm:top-20 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-pink-300/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-10 w-40 h-40 sm:w-96 sm:h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-24 h-24 sm:w-64 sm:h-64 bg-rose-300/30 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4 sm:space-y-6 md:space-y-8"
          >
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                <span className="hidden sm:inline">Trusted by 500+ Happy Customers</span>
                <span className="sm:hidden">500+ Happy Customers</span>
              </span>
              <div className="flex -space-x-1 sm:-space-x-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight sm:leading-tight"
            >
              <span className="block text-gray-900">Transform Your</span>
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                Vision Into
              </span>
              <span className="block text-gray-900">Beautiful Reality</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 font-light max-w-xl"
            >
              We turn your thoughts & emotions into reality and happiness through custom stitched designer suits
            </motion.p>

            {/* Feature Points */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-600 rounded-full flex-shrink-0" />
                <span className="text-gray-700">Custom Measurements</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full flex-shrink-0" />
                <span className="text-gray-700">7-10 Days Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-600 rounded-full flex-shrink-0" />
                <span className="text-gray-700">Premium Fabrics</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
            >
              {/* Primary CTA - Start Custom Order */}
              <Link
                href="/custom-order"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-pink-700 hover:to-purple-700 min-h-[48px] sm:min-h-[56px]"
              >
                <span>Start Custom Order</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary CTA - Browse Collections */}
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 hover:border-pink-300 min-h-[48px] sm:min-h-[56px]"
              >
                <span>Browse Collections</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-gray-200"
            >
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">500+</div>
                <div className="text-xs sm:text-sm text-gray-600">Orders Completed</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">98%</div>
                <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">7-10</div>
                <div className="text-xs sm:text-sm text-gray-600">Days Delivery</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative order-first lg:order-last"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
              {/* Main Hero Image (placeholder asset to avoid 404) */}
              <div className="relative w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <Image
                  src="/globe.svg"
                  alt="Beautiful custom stitched designer suit"
                  width={400}
                  height={400}
                  className="object-contain w-full h-full p-4 sm:p-8"
                  priority
                  quality={75}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  unoptimized
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Floating Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-gray-900">Custom Stitching</div>
                    <div className="text-xs sm:text-sm text-gray-600">Perfect fit guaranteed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements Around Image - Hidden on mobile */}
            <div className="hidden sm:block absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-2xl opacity-60 animate-pulse" />
            <div className="hidden sm:block absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-400 to-rose-400 rounded-full blur-2xl opacity-60 animate-pulse delay-1000" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gray-400 rounded-full animate-scroll" />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}