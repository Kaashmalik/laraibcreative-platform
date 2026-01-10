'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight, Crown, Gem, Snowflake } from 'lucide-react';

const SLIDES = [
  {
    id: 'custom',
    title: 'Transform Your Vision Into Beautiful Reality',
    highlight: 'Vision Into',
    tagline: 'We turn your thoughts & emotions into reality and happiness through custom stitched designer suits',
    image: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1/laraibcreative/hero/hero_fashion_model_v1',
    color: 'from-pink-600 via-purple-600 to-rose-600',
    bgGradient: 'from-pink-50 via-purple-50 to-rose-50',
    badge: 'Custom Stitching',
    badgeIcon: Sparkles,
    stats: [
      { value: '500+', label: 'Orders Completed' },
      { value: '98%', label: 'Happy Customers' },
      { value: '7-10', label: 'Days Delivery' }
    ]
  },
  {
    id: 'bridal',
    title: 'Royal Elegance for Your Special Day',
    highlight: 'Royal Elegance',
    tagline: 'Exquisite bridal couture handcrafted with intricate zardozi, tilla work, and traditional artistry',
    image: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766074944/laraibcreative/hero/hero_bridal.jpg',
    color: 'from-red-600 via-amber-600 to-orange-600',
    bgGradient: 'from-orange-50 via-red-50 to-amber-50',
    badge: 'Bridal Collection',
    badgeIcon: Crown,
    stats: [
      { value: 'Pure', label: 'Handwork' },
      { value: 'Custom', label: 'Fitting' },
      { value: 'Global', label: 'Shipping' }
    ]
  },
  {
    id: 'party',
    title: 'Contemporary Chic for Every Occasion',
    highlight: 'Contemporary Chic',
    tagline: 'Modern cuts, soft chiffons, and pastel hues perfect for evening soirees and festive gatherings',
    image: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766074946/laraibcreative/hero/hero_party.jpg',
    color: 'from-teal-600 via-emerald-500 to-cyan-600',
    bgGradient: 'from-teal-50 via-cyan-50 to-emerald-50',
    badge: 'Party Wear',
    badgeIcon: Gem,
    stats: [
      { value: 'New', label: 'Arrivals' },
      { value: 'Ready', label: 'To Wear' },
      { value: 'Trend', label: 'Setter' }
    ]
  },
  {
    id: 'velvet',
    title: 'Warmth & Luxury in Winter Velvet',
    highlight: 'Luxury in Velvet',
    tagline: 'Embrace the season with rich velvet fabrics, intricate shawls, and timeless gold embroidery',
    image: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766074948/laraibcreative/hero/hero_velvet.jpg',
    color: 'from-emerald-800 via-green-700 to-teal-800',
    bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
    badge: 'Winter Collection',
    badgeIcon: Snowflake,
    stats: [
      { value: '100%', label: 'Pure Velvet' },
      { value: 'Warm', label: '& Stylish' },
      { value: 'Limited', label: 'Edition' }
    ]
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  return (
    <section className={`relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${slide.bgGradient}`}>

      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" /> */}
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse transition-colors duration-1000 bg-${slide.color.split(' ')[1]}`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse delay-1000 transition-colors duration-1000 bg-${slide.color.split(' ')[3]}`} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">

          {/* Left Column - Text Content */}
          <div className="space-y-6 sm:space-y-8 relative z-20">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/40">
                  <slide.badgeIcon className={`w-4 h-4 text-${slide.color.split(' ')[1]}`} />
                  <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">{slide.badge}</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-gray-900 tracking-tight">
                  <span className="block">{slide.title.replace(slide.highlight, '')}</span>
                  <span className={`block bg-clip-text text-transparent bg-gradient-to-r ${slide.color}`}>
                    {slide.highlight}
                  </span>
                </h1>

                {/* Tagline */}
                <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed font-light">
                  {slide.tagline}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/custom-order" className={`group relative px-8 py-4 bg-gradient-to-r ${slide.color} text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden`}>
                    <span className="relative z-10 flex items-center gap-2">
                      Start Order <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                  <Link href="/products" className="group px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-semibold shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex items-center gap-2">
                    Browse Shop
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
                  {slide.stats.map((stat, i) => (
                    <div key={i}>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Image Slider */}
          <div className="relative order-first lg:order-last">
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-none rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/20">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={slide.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 w-full h-full bg-gray-100"
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    unoptimized
                  />
                  {/* Glass Overlay on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Floating Badge on Image with Glassmorphism */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white">
                        <slide.badgeIcon className="w-6 h-6" />
                      </div>
                      <div className="text-white">
                        <p className="font-semibold text-lg leading-tight">{slide.badge}</p>
                        <p className="text-sm text-white/80">{slide.tagline.split(' ').slice(0, 5).join(' ')}...</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentSlide ? 1 : -1);
                    setCurrentSlide(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? `w-8 bg-gray-800` : `w-2 bg-gray-300 hover:bg-gray-400`
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}