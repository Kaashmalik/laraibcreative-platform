import Link from 'next/link'
import Image from 'next/image'
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Send
} from 'lucide-react'

/**
 * Footer Component
 * 
 * Features:
 * - Multi-column layout (responsive)
 * - Quick links navigation
 * - Contact information
 * - Social media links
 * - Newsletter subscription
 * - Payment methods icons
 * - SEO-friendly structure
 * - Accessibility compliant
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Footer navigation sections
  const footerSections = {
    shop: {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/products' },
        { label: 'Bridal Wear', href: '/products?category=bridal' },
        { label: 'Party Wear', href: '/products?category=party' },
        { label: 'Casual Wear', href: '/products?category=casual' },
        { label: 'Designer Replicas', href: '/products?category=designer' },
        { label: 'Custom Order', href: '/custom-order' },
      ]
    },
    customer: {
      title: 'Customer Service',
      links: [
        { label: 'My Account', href: '/account' },
        { label: 'Track Order', href: '/track-order' },
        { label: 'Size Guide', href: '/size-guide' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Stitching Policy', href: '/policies/stitching' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Shipping Policy', href: '/policies/shipping' },
        { label: 'Return Policy', href: '/policies/returns' },
        { label: 'Privacy Policy', href: '/policies/privacy' },
        { label: 'Terms of Service', href: '/policies/terms' },
      ]
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.svg"
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

            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="tel:+923001234567" 
                className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Call Us</p>
                  <p className="font-medium text-white">+92 300 1234567</p>
                </div>
              </a>
              <a 
                href="mailto:info@laraibcreative.com" 
                className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-white">info@laraibcreative.com</p>
                </div>
              </a>
              <div className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-white">Lahore, Punjab, Pakistan</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://facebook.com/laraibcreative"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/laraibcreative"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                aria-label="Contact us on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h4 className="font-semibold text-white text-lg mb-2">
              Subscribe to Our Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Get updates on new designs, exclusive offers, and fashion tips.
            </p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm mb-4">We Accept</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 bg-gray-800 rounded text-gray-300 text-sm font-medium">
              Bank Transfer
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded text-gray-300 text-sm font-medium">
              JazzCash
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded text-gray-300 text-sm font-medium">
              Easypaisa
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded text-gray-300 text-sm font-medium">
              Cash on Delivery
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} LaraibCreative. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/policies/privacy" className="hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="hover:text-primary-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}