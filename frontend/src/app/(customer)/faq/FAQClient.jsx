"use client";

import { useState } from 'react';

const faqs = [
  {
    question: "How do I place a custom order?",
    answer: "Visit our Custom Order page, select your preferences, upload reference images, and submit your measurements. Our team will contact you to confirm details."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 7 days of delivery. Items must be unused with original tags attached. Custom orders cannot be returned."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 5-7 business days. Custom orders may take 2-3 weeks depending on complexity."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within Pakistan. International shipping coming soon."
  },
  {
    question: "How do I track my order?",
    answer: "You'll receive a tracking number via email once your order ships. Use our Track Order page to check status."
  }
];

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState(null);

  // Enhanced FAQ Structured Data (JSON-LD) with SEO optimizations
  // Validated against Schema.org FAQPage specification
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq, index) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-center mb-12">
          Find answers to common questions about our products and services.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

