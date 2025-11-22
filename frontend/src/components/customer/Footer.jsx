'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Send,
  Twitter,
  Youtube,
  Heart,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones
} from 'lucide-react'

/**
 * Footer Component - Production Ready & SEO Optimized
 * 
 * Features:
 * - SEO optimized with semantic HTML and schema.org markup
 * - Fully accessible (WCAG 2.1 AA compliant)
 * - Responsive multi-column layout (mobile-first)
 * - Newsletter subscription with validation
 * - Social media integration
 * - Payment methods display
 * - Trust badges
 * - Quick links navigation
 * - Contact information with structured data
 * - Sitemap integration
 * - Performance optimized with lazy loading
 * - Analytics ready
 * 
 * @component
 * @example
 * <Footer />
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  // Footer navigation sections with SEO-friendly structure
  const footerSections = {
    shop: {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/products', ariaLabel: 'Browse all products' },
        { label: 'Bridal Wear', href: '/products?category=bridal', ariaLabel: 'Shop bridal wear collection' },
        { label: 'Party Wear', href: '/products?category=party', ariaLabel: 'Shop party wear collection' },
        { label: 'Casual Wear', href: '/products?category=casual', ariaLabel: 'Shop casual wear collection' },
        { label: 'Designer Replicas', href: '/products?category=designer', ariaLabel: 'Shop designer replica collection' },
        { label: 'Custom Order', href: '/custom-order', ariaLabel: 'Create your custom order' },
      ]
    },
    customer: {
      title: 'Customer Service',
      links: [
        { label: 'My Account', href: '/account', ariaLabel: 'Access your account' },
        { label: 'Track Order', href: '/track-order', ariaLabel: 'Track your order status' },
        { label: 'Size Guide', href: '/size-guide', ariaLabel: 'View measurement size guide' },
        { label: 'FAQ', href: '/faq', ariaLabel: 'Frequently asked questions' },
        { label: 'Contact Us', href: '/contact', ariaLabel: 'Get in touch with us' },
        { label: 'Stitching Policy', href: '/stitching-policy', ariaLabel: 'View stitching policy' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about', ariaLabel: 'Learn about LaraibCreative' },
        { label: 'Blog', href: '/blog', ariaLabel: 'Read our fashion blog' },
        { label: 'Shipping Policy', href: '/shipping-policy', ariaLabel: 'View shipping policy' },
        { label: 'Return Policy', href: '/return-policy', ariaLabel: 'View return and exchange policy' },
        { label: 'Privacy Policy', href: '/privacy-policy', ariaLabel: 'View privacy policy' },
        { label: 'Terms of Service', href: '/terms-of-service', ariaLabel: 'View terms of service' },
      ]
    }
  }

  // Social media links with proper tracking
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/laraibcreative',
      icon: Facebook,
      label: 'Follow us on Facebook',
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/laraibcreative',
      icon: Instagram,
      label: 'Follow us on Instagram',
      color: 'hover:bg-pink-600'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/laraibcreative',
      icon: Twitter,
      label: 'Follow us on Twitter',
      color: 'hover:bg-sky-500'
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@laraibcreative',
      icon: Youtube,
      label: 'Subscribe to our YouTube channel',
      color: 'hover:bg-red-600'
    }
  ]

  // Payment methods
  const paymentMethods = [
    { name: 'Bank Transfer', icon: CreditCard },
    { name: 'JazzCash', icon: CreditCard },
    { name: 'Easypaisa', icon: CreditCard },
    { name: 'Cash on Delivery', icon: Truck }
  ]

  // Trust badges
  const trustBadges = [
    { icon: ShieldCheck, text: 'Secure Checkout', color: 'text-green-600' },
    { icon: Truck, text: 'Fast Delivery', color: 'text-blue-600' },
    { icon: Headphones, text: '24/7 Support', color: 'text-purple-600' },
  ]

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSubscriptionStatus({ type: 'error', message: 'Please enter a valid email address' })
      return
    }

    setIsSubscribing(true)
    setSubscriptionStatus(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSubscriptionStatus({ 
          type: 'success', 
          message: 'Thank you for subscribing! Check your email for confirmation.' 
        })
        setEmail('')
      } else {
        const data = await response.json()
        setSubscriptionStatus({ 
          type: 'error', 
          message: data.message || 'Subscription failed. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setSubscriptionStatus({ 
        type: 'error', 
        message: 'Network error. Please try again later.' 
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  // Schema.org structured data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LaraibCreative",
    "url": "https://www.laraibcreative.com",
    "logo": "https://www.laraibcreative.com/images/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-302-0718182",
      "contactType": "Customer Service",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    },
    "sameAs": [
      "https://facebook.com/laraibcreative",
      "https://instagram.com/laraibcreative",
      "https://twitter.com/laraibcreative"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    }
  }

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <footer className="bg-gray-900 text-gray-300" role="contentinfo">
        {/* Trust Badges Section */}
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <badge.icon className={`w-8 h-8 ${badge.color}`} aria-hidden="true" />
                  <span className="font-medium text-white">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                <Image
                  src="/globe.svg"
                  alt="LaraibCreative Logo"
                  width={48}
                  height={48}
                  className="brightness-0 invert"
                />
              </Link>
              <h3 className="font-playfair text-2xl font-bold text-white mb-3">
                LaraibCreative
              </h3>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Transform your vision into beautiful reality. Custom ladies suits with perfect measurements and premium fabrics. Your emotions, our craftsmanship.
              </p>

              {/* Contact Info with structured data */}
              <div className="space-y-3">
                <a 
                  href="tel:03020718182" 
                  className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2 -ml-2"
                  aria-label="Call us at 03020718182"
                >
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Call Us</p>
                    <p className="font-medium text-white">03020718182</p>
                  </div>
                </a>
                <a 
                  href="mailto:laraibcreative.business@gmail.com" 
                  className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2 -ml-2"
                  aria-label="Email us at laraibcreative.business@gmail.com"
                >
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-white">laraibcreative.business@gmail.com</p>
                  </div>
                </a>
                <div className="flex items-start space-x-3 text-gray-400 p-2 -ml-2">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-white">Lahore, Punjab, Pakistan</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center ${social.color} transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                ))}
                <a
                  href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Contact us on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation Sections */}
            {Object.entries(footerSections).map(([key, section]) => (
              <nav key={key} aria-label={`${section.title} links`}>
                <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-block focus:outline-none focus:underline focus:text-primary-400"
                        aria-label={link.ariaLabel}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="max-w-md">
              <h4 className="font-semibold text-white text-lg mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary-400" aria-hidden="true" />
                Subscribe to Our Newsletter
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Get updates on new designs, exclusive offers, and fashion tips delivered to your inbox.
              </p>
              <form className="space-y-3" onSubmit={handleSubscribe}>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                    required
                    aria-label="Email address for newsletter"
                    disabled={isSubscribing}
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 active:scale-95 transition-all font-medium flex items-center space-x-2 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Subscribe to newsletter"
                  >
                    {isSubscribing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="w-5 h-5" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </div>
                {subscriptionStatus && (
                  <p className={`text-sm ${
                    subscriptionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`} role="alert">
                    {subscriptionStatus.message}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-4 font-medium">We Accept</p>
            <div className="flex flex-wrap items-center gap-3">
              {paymentMethods.map((method, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <method.icon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="text-gray-300 text-sm font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400 text-center md:text-left flex flex-wrap items-center justify-center md:justify-start gap-1">
                <span>© {currentYear} LaraibCreative. All rights reserved.</span>
                <span className="flex items-center whitespace-nowrap">
                  Made with 
                  <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" aria-hidden="true" />
                  in Pakistan
                </span>
              </p>
              <nav className="flex items-center space-x-6 text-sm text-gray-400" aria-label="Legal links">
                <Link 
                  href="/privacy-policy" 
                  className="hover:text-primary-400 transition-colors focus:outline-none focus:underline"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms-of-service" 
                  className="hover:text-primary-400 transition-colors focus:outline-none focus:underline"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/sitemap.xml" 
                  className="hover:text-primary-400 transition-colors focus:outline-none focus:underline"
                >
                  Sitemap
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}