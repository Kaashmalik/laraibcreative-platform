import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Scissors, Truck, RefreshCw, Phone } from 'lucide-react';

/**
 * FAQ Page Component
 * 
 * Features:
 * - Accordion-style expandable sections
 * - Search functionality
 * - Categorized FAQs
 * - Smooth animations
 * - Quick contact CTA
 * - Mobile responsive
 * - SEO optimized with FAQ Schema
 */

// Metadata for SEO
export const metadata = {
  title: 'FAQ - Frequently Asked Questions | LaraibCreative',
  description: 'Find answers to common questions about custom stitching, measurements, ordering, payments, and delivery at LaraibCreative.',
  keywords: 'faq, custom stitching questions, how to order, measurement guide, delivery time, payment methods',
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // FAQ Categories
  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'stitching', label: 'Stitching', icon: Scissors },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'returns', label: 'Returns', icon: RefreshCw }
  ];

  // FAQ Data
  const faqs = [
    // Orders
    {
      category: 'orders',
      question: 'How do I place a custom stitching order?',
      answer: 'Placing a custom order is easy! Click on "Custom Order" in the menu, choose your service type (fully custom or brand article copy), upload reference images if needed, select fabric, enter your measurements, and proceed to checkout. You can also browse our product catalog and select "Custom Stitch This" on any design.'
    },
    {
      category: 'orders',
      question: "Can I order if I don't have exact measurements?",
      answer: 'Yes! We provide a detailed size guide with standard measurements for S, M, L, XL sizes. You can also watch our measurement tutorial video or contact us on WhatsApp for assistance. We recommend taking measurements for the best fit, but standard sizes work too.'
    },
    {
      category: 'orders',
      question: 'How long does it take to complete my order?',
      answer: 'Standard orders take 10-14 working days from payment confirmation. Rush orders (7 days) are available for an additional fee. Bridal and heavy embroidery work may take 15-20 days. You can track your order status in real-time through your account.'
    },
    {
      category: 'orders',
      question: 'Can I cancel or modify my order?',
      answer: 'You can cancel or modify your order within 24 hours of placing it, before we start stitching. Once stitching begins, cancellation is not possible but alterations can be done after delivery. Contact us immediately if you need changes.'
    },
    {
      category: 'orders',
      question: 'What if I want to copy a brand article design?',
      answer: "We specialize in designer replicas! Simply upload clear photos of the original design from all angles, specify any modifications you want, select your fabric, and we'll recreate it for you with precision."
    },

    // Payments
    {
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers (HBL, MCB, Meezan), JazzCash, EasyPaisa, and Cash on Delivery (COD) for orders within Lahore. For online payments, you need to upload a screenshot/receipt of your transaction.'
    },
    {
      category: 'payments',
      question: 'When do I need to pay?',
      answer: 'Full payment is required before we start stitching your order. For COD orders, payment is collected upon delivery. We start work only after payment verification.'
    },
    {
      category: 'payments',
      question: 'How do I upload my payment receipt?',
      answer: "During checkout, you'll see an upload button in the payment section. Take a clear screenshot of your transaction showing the transaction ID, date, and amount, then upload it. You can also email it to orders@laraibcreative.com with your order number."
    },
    {
      category: 'payments',
      question: 'Is my payment secure?',
      answer: 'Absolutely! All payment information is handled securely. We never store your banking credentials. For bank transfers, you make the payment directly through your bank app, and we only need the receipt for verification.'
    },
    {
      category: 'payments',
      question: 'Do you offer refunds?',
      answer: "Refunds are processed for orders cancelled within 24 hours before stitching starts. Once stitching begins, we cannot offer refunds, but we'll work with you to ensure alterations meet your satisfaction."
    },

    // Stitching
    {
      category: 'stitching',
      question: 'What types of stitching services do you offer?',
      answer: 'We offer fully custom stitching (your design ideas), designer replica stitching (copy brand articles), alterations and adjustments, embroidery and embellishments, bridal and party wear stitching, and casual everyday wear.'
    },
    {
      category: 'stitching',
      question: 'Do I need to provide fabric?',
      answer: "No, you can choose fabric from our catalog and we'll include it in the price. However, if you have your own fabric, you can send it to us and we'll only charge stitching fees."
    },
    {
      category: 'stitching',
      question: 'How accurate will the measurements be?',
      answer: 'We follow your provided measurements exactly. Our experienced tailors have been stitching for 10+ years and ensure precision. If measurements are slightly off, we offer free alterations within 7 days of delivery.'
    },
    {
      category: 'stitching',
      question: 'Can you add customizations like extra embroidery?',
      answer: "Yes! You can request additional embroidery, sequins, lace work, or any embellishments. Mention your requirements in the special instructions during order, and we'll provide a quote."
    },
    {
      category: 'stitching',
      question: "What if the stitching doesn't match the reference image?",
      answer: "We strive for 95%+ accuracy with reference images. If there's a significant difference, contact us within 3 days of delivery with photos, and we'll make it right through alterations or a redo if necessary."
    },

    // Delivery
    {
      category: 'delivery',
      question: 'Do you deliver across Pakistan?',
      answer: 'Yes! We deliver to all major cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and more. Delivery charges vary by city.'
    },
    {
      category: 'delivery',
      question: 'How much are the delivery charges?',
      answer: 'Within Lahore: Rs. 200 | Major cities (Karachi, Islamabad): Rs. 250 | Other cities: Rs. 300-400. Free delivery on orders above Rs. 5,000!'
    },
    {
      category: 'delivery',
      question: 'Can I track my order?',
      answer: "Yes! Once your order is dispatched, you'll receive a tracking number via WhatsApp and email. You can also track status in real-time through your account dashboard."
    },
    {
      category: 'delivery',
      question: "What if I'm not available at delivery time?",
      answer: 'Our courier will attempt delivery 2-3 times. You can also coordinate with them via the tracking number to schedule a convenient time. Alternatively, provide an alternate contact person.'
    },
    {
      category: 'delivery',
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Pakistan. International shipping is coming soon! Follow us on Instagram for updates.'
    },

    // Returns & Alterations
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: "We don't accept returns on custom-stitched items as they're made specifically for you. However, we offer free alterations within 7 days if there's a fitting issue. For ready-made products, returns are accepted within 7 days if unworn."
    },
    {
      category: 'returns',
      question: 'Are alterations free?',
      answer: "Yes! First alteration within 7 days of delivery is completely free if it's due to measurement discrepancy or fitting issues. You'll need to send the item back to us (shipping covered by you) and we'll fix it and return it."
    },
    {
      category: 'returns',
      question: "What if the color doesn't match?",
      answer: "Fabric colors may vary slightly due to screen settings and lighting. We try our best to match colors accurately. If there's a significant mismatch, contact us within 24 hours of delivery with photos, and we'll find a solution."
    },
    {
      category: 'returns',
      question: 'How do I request an alteration?',
      answer: "Contact us via WhatsApp (+92 300 1234567) within 7 days of delivery. Share photos showing the fitting issue and your order number. We'll guide you through the alteration process."
    },
    {
      category: 'returns',
      question: 'Can I exchange for a different design?',
      answer: "Exchanges are not possible for custom-stitched items. However, if you're not satisfied, we'll work with you to alter the current design to your liking or offer a discount on your next order."
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle accordion
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-pink-600 transition">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">FAQ</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our custom stitching services, 
            ordering process, and more.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No questions found matching your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-pink-300 transition"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900 flex-1">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-pink-600 flex-shrink-0 transition-transform duration-300 ${
                          openIndex === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openIndex === index ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 py-5 bg-gray-50 border-t-2 border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Phone className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-pink-100 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 transition"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;