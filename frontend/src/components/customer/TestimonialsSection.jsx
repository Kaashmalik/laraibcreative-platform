// frontend/src/components/customer/TestimonialsSection.jsx
'use client'

import { useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Ayesha Khan',
    location: 'Lahore',
    rating: 5,
    image: '/images/testimonials/avatar1.jpg',
    text: 'The stitching quality is exceptional! My bridal outfit was perfect down to every detail. The team understood exactly what I wanted and delivered beyond my expectations.',
    date: 'Oct 2024',
    orderType: 'Bridal Wear'
  },
  {
    id: 2,
    name: 'Fatima Ahmed',
    location: 'Karachi',
    rating: 5,
    image: '/images/testimonials/avatar2.jpg',
    text: 'I ordered a designer replica and it came out exactly like the original! Perfect fit and the fabric quality was amazing. Will definitely order again.',
    date: 'Sep 2024',
    orderType: 'Designer Replica'
  },
  {
    id: 3,
    name: 'Sana Malik',
    location: 'Islamabad',
    rating: 5,
    image: '/images/testimonials/avatar3.jpg',
    text: 'Fast delivery and beautiful work! The measurements guide was very helpful and my party suit fits perfectly. Highly recommended!',
    date: 'Oct 2024',
    orderType: 'Party Wear'
  },
  {
    id: 4,
    name: 'Zara Hussain',
    location: 'Rawalpindi',
    rating: 5,
    image: '/images/testimonials/avatar4.jpg',
    text: 'Outstanding service! They kept me updated throughout the process. The final result was stunning and I received so many compliments.',
    date: 'Sep 2024',
    orderType: 'Casual Wear'
  },
  {
    id: 5,
    name: 'Maria Raza',
    location: 'Faisalabad',
    rating: 5,
    image: '/images/testimonials/avatar5.jpg',
    text: 'Professional and reliable! The custom stitching was flawless and the attention to detail was impressive. Worth every penny!',
    date: 'Aug 2024',
    orderType: 'Formal Wear'
  },
  {
    id: 6,
    name: 'Hira Shahid',
    location: 'Multan',
    rating: 5,
    image: '/images/testimonials/avatar6.jpg',
    text: 'Best tailoring service online! The quality is top-notch and customer service is excellent. My go-to place for all my stitching needs now.',
    date: 'Aug 2024',
    orderType: 'Party Wear'
  }
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length])
    }
    return visible
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
            CUSTOMER REVIEWS
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who transformed their vision into reality
          </p>
        </div>

        {/* Desktop View - 3 Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
          {getVisibleTestimonials().map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location} • {testimonial.date}</p>
                </div>
              </div>

              {/* Order Type Badge */}
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                  {testimonial.orderType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View - 1 Card */}
        <div className="md:hidden relative">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            {/* Rating Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              "{testimonials[currentIndex].text}"
            </p>

            {/* Customer Info */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {testimonials[currentIndex].name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                <p className="text-sm text-gray-500">{testimonials[currentIndex].location} • {testimonials[currentIndex].date}</p>
              </div>
            </div>

            {/* Order Type Badge */}
            <div className="mt-4">
              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                {testimonials[currentIndex].orderType}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={prevTestimonial}
            className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-pink-500 to-purple-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 hover:scale-110"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Overall Rating Summary */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full border border-pink-200">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900">4.9</span>
            <span className="text-gray-600">from 156+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}