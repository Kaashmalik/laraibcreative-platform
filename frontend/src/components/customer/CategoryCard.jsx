'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * CategoryCard Component
 * Displays category with image, title, product count, and hover effects
 * Features:
 * - Image zoom on hover
 * - Gradient overlay
 * - Smooth transitions
 * - Product count badge
 * - Responsive design
 * 
 * @param {string} title - Category name
 * @param {string} image - Category image URL
 * @param {string} slug - URL-friendly category identifier
 * @param {number} count - Number of products in category
 */
export default function CategoryCard({ category }) {
  const { name: title, image, slug, productCount: count } = category;
  return (
    <Link
      href={`/products/${slug}`}
      className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
        {/* Placeholder gradient (in production, replace with actual image) */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200" />
        
        {/* In production, uncomment this for actual images */}
        {/* <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        /> */}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Product Count Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow-lg">
            {count} Items
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          {/* Category Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
            {title}
          </h3>

          {/* Explore Button */}
          <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-sm font-medium">Explore Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Decorative Corner Element */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Bottom Info Bar (appears on hover on desktop, always visible on mobile) */}
      <div className="md:absolute md:bottom-0 md:left-0 md:right-0 bg-white p-4 md:transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-600">{count} Products Available</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}