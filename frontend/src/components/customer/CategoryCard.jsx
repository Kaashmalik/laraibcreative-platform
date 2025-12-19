'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_IMAGES = {
  'ready-made-suits': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766075618/laraibcreative/categories/cat_ready_made.jpg',
  'brand-replicas': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766075622/laraibcreative/categories/cat_replicas.jpg',
  'hand-karhai-collection': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766075729/laraibcreative/categories/cat_karhai.jpg',
  'unstitched-fabric': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766075734/laraibcreative/categories/cat_fabric.jpg',
  'bridal-collection': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076040/laraibcreative/categories/cat_bridal.jpg',
  'party-formal-wear': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076044/laraibcreative/categories/cat_party_formal.jpg',
  'casual-everyday': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076050/laraibcreative/categories/cat_casual.jpg',
  'casual-wear': 'https://res.cloudinary.com/dupjniwgq/image/upload/v1766076050/laraibcreative/categories/cat_casual.jpg'
};

/**
 * CategoryCard Component
 * Displays category with premium image background and glassmorphism details
 */
export default function CategoryCard({ category }) {
  const { name: title, slug, productCount: count } = category;

  // Fallback to random generic fashion image if slug doesn't match
  const imageUrl = CATEGORY_IMAGES[slug] || category.image || 'https://res.cloudinary.com/dupjniwgq/image/upload/v1/laraibcreative/hero/hero_fashion_model_v1';

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative block overflow-hidden rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 h-[400px] w-full"
    >
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 w-full h-full bg-gray-200">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Soft dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
      </div>

      {/* Floating Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-10 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-xl flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          {count} Items
        </div>
      </div>

      {/* Content Overlay (Bottom) */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-serif tracking-wide border-l-4 border-pink-500 pl-4">
            {title}
          </h3>

          {/* Hidden description/CTA that reveals on hover */}
          <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 pl-4 opacity-0 group-hover:opacity-100">
            <p className="text-gray-200 text-sm mb-4 font-light leading-relaxed line-clamp-2">
              Explore our exclusive {title.toLowerCase()} collection crafted with passion.
            </p>
            <span className="inline-flex items-center gap-2 text-white font-medium border-b border-white/50 pb-0.5 group-hover:border-white transition-colors">
              Shop Now <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
    </Link>
  );
}