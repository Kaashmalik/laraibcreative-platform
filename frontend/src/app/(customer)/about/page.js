import React from 'react';
import { Award, Users, Heart, Sparkles, Clock, CheckCircle } from 'lucide-react';

/**
 * About Page Component
 * 
 * Features:
 * - Brand story with timeline
 * - Core values and mission
 * - Team introduction
 * - Why choose us section
 * - Statistics showcase
 * - SEO optimized with proper meta tags
 * - Mobile responsive design
 * - Breadcrumbs navigation
 * - Call to action
 */

// Metadata for SEO (in actual Next.js app, export this)
export const metadata = {
  title: 'About Us - LaraibCreative | Custom Ladies Suits & Stitching Services',
  description: 'Learn about LaraibCreative - We turn your thoughts & emotions into beautiful reality. Expert custom stitching services for ladies suits across Pakistan since 2020.',
  keywords: 'about laraibcreative, custom tailoring pakistan, ladies suit stitching, our story, fashion designers lahore',
  openGraph: {
    title: 'About LaraibCreative - Custom Stitching Experts',
    description: 'Expert custom stitching services transforming your fashion dreams into reality',
    type: 'website',
  }
};

const AboutPage = () => {
  // Stats data
  const stats = [
    { icon: Users, value: '5000+', label: 'Happy Customers' },
    { icon: CheckCircle, value: '10000+', label: 'Orders Completed' },
    { icon: Award, value: '4.9/5', label: 'Average Rating' },
    { icon: Clock, value: '5 Years', label: 'In Business' }
  ];

  // Core values
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction and happiness are our top priorities. We listen, understand, and deliver exactly what you envision.'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We never compromise on quality. Every stitch, every detail is crafted with precision and care.'
    },
    {
      icon: Sparkles,
      title: 'Creative Innovation',
      description: 'From traditional designs to modern trends, we bring creativity and innovation to every piece we create.'
    },
    {
      icon: Clock,
      title: 'Timely Delivery',
      description: 'We respect your time and special occasions. Reliable delivery is our commitment to you.'
    }
  ];

  // Why choose us features
  const features = [
    'Expert tailors with 10+ years experience',
    'Premium quality fabrics and materials',
    'Perfect fit guaranteed with detailed measurements',
    'Designer replica services available',
    'Custom designs from your imagination',
    'Affordable pricing with no hidden costs',
    'Fast turnaround time (7-14 days)',
    'Doorstep delivery across Pakistan',
    'Easy alterations if needed',
    'WhatsApp support for instant queries'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-pink-600 transition">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">About Us</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We Turn Your Thoughts & Emotions Into
              <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Beautiful Reality
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              At LaraibCreative, we believe every woman deserves to wear something 
              that makes her feel confident, beautiful, and truly herself. That's why 
              we pour our hearts into every stitch.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
            
            <div className="space-y-8">
              {/* Timeline Item 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    2020
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The Beginning</h3>
                  <p className="text-gray-600">
                    LaraibCreative started with a simple dream - to help women express 
                    their unique style through custom-tailored clothing. What began as a 
                    small home-based operation quickly grew as word spread about our 
                    attention to detail and personalized service.
                  </p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    2022
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Going Digital</h3>
                  <p className="text-gray-600">
                    Recognizing the need for convenience, we launched our online platform, 
                    making custom stitching accessible to women across Pakistan. Our 
                    innovative measurement system and detailed consultation process ensured 
                    the perfect fit, even online.
                  </p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    2025
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Today & Beyond</h3>
                  <p className="text-gray-600">
                    Today, we're proud to have served thousands of happy customers, from 
                    brides on their special day to working women seeking everyday elegance. 
                    Our commitment remains the same: turning your fashion dreams into 
                    reality, one stitch at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and every stitch we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4">
                  <value.icon className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LaraibCreative?</h2>
              <p className="text-gray-600">
                Here's what makes us different and why thousands of customers trust us
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-pink-50 transition">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower women through fashion by providing accessible, high-quality 
                  custom stitching services that celebrate individuality and style. We 
                  strive to make every woman feel confident and beautiful in clothes 
                  that are uniquely hers.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become Pakistan's most trusted and loved custom stitching brand, 
                  known for transforming dreams into wearable art. We envision a future 
                  where every woman has access to personalized, affordable fashion that 
                  makes her feel extraordinary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the LaraibCreative Difference?
          </h2>
          <p className="text-xl mb-8 text-pink-100 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us with their special moments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/custom-order"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition transform hover:scale-105"
            >
              Start Custom Order
            </a>
            <a 
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 transition"
            >
              Browse Collections
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;