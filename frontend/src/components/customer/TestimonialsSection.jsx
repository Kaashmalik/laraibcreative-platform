'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ayesha Khan',
    role: 'Bridal Customer',
    location: 'Lahore, PK',
    content: "The attention to detail on my bridal lehenga was absolutely breathtaking. The zardozi work is even more stunning in person. Felt like a queen on my big day!",
    rating: 5,
    avatar: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076357/laraibcreative/testimonials/avatar_woman_1.jpg',
    verified: true
  },
  {
    id: 2,
    name: 'Fatima Ahmed',
    role: 'Regular Client',
    location: 'Karachi, PK',
    content: "I've ordered multiple times and the consistency in fitting and fabric quality is unmatched. Their custom stitching service is a lifesaver for overseas Pakistanis.",
    rating: 5,
    avatar: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076499/laraibcreative/testimonials/avatar_woman_2.jpg',
    verified: true
  },
  {
    id: 3,
    name: 'Mrs. Zara Malik',
    role: 'VIP Customer',
    location: 'Islamabad, PK',
    content: "Professionalism at its peak. The team guided me through fabric selection for my daughter's wedding trousseau. Highly recommended for luxury wear.",
    rating: 5,
    avatar: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076502/laraibcreative/testimonials/avatar_woman_3.jpg',
    verified: true
  },
  {
    id: 4,
    name: 'Sana Raza',
    role: 'Fashion Enthusiast',
    location: 'London, UK',
    content: "Fast delivery to London! The colors of the lawn suits were exactly as shown on the website. Good packaging and premium feel.",
    rating: 5,
    avatar: 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076357/laraibcreative/testimonials/avatar_woman_1.jpg', // Reusing for demo scroll
    verified: true
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10 mb-16 text-center">
        <span className="text-pink-400 font-medium tracking-widest text-sm uppercase mb-2 block">Our Happy Clients</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
          Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Elegance</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Discover why thousands of style-conscious women trust LaraibCreative for their most cherished moments.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden mask-linear-fade">
        {/* We duplicate the array to create a seamless infinite loop */}
        <div className="flex gap-6 w-max animate-marquee hover:pause-marquee pl-4">
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
            <div
              key={`${testimonial.id}-${idx}`}
              className="w-[350px] md:w-[400px] flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-pink-500/20 transition-colors" />

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 italic mb-8 leading-relaxed text-lg">
                "{testimonial.content}"
              </p>

              {/* User Profile */}
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-pink-500/50">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .hover\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}