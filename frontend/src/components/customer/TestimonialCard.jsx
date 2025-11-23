'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, BadgeCheck, Quote } from 'lucide-react';

/**
 * TestimonialCard Component
 * Displays customer review with rating, image, and verification badge
 * Features:
 * - Star rating display
 * - Customer avatar
 * - Verified purchase badge
 * - Quote decoration
 * - Read more/less for long reviews
 * - Hover effects
 * - Before/after images (optional)
 * 
 * @param {string} name - Customer name
 * @param {string} image - Customer avatar URL
 * @param {number} rating - Rating out of 5
 * @param {string} comment - Review text
 * @param {string} date - Review date
 * @param {boolean} verified - Verified purchase status
 * @param {array} beforeAfterImages - Optional before/after comparison images
 */
export default function TestimonialCard({ testimonial }) {
  const { name, image, rating, comment, date, verified, beforeAfterImages } = testimonial;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImages, setShowImages] = useState(false);

  // Truncate comment if too long
  const shouldTruncate = comment.length > 150;
  const displayComment = shouldTruncate && !isExpanded 
    ? comment.slice(0, 150) + '...' 
    : comment;

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200">
      {/* Quote Icon Decoration */}
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Quote className="w-6 h-6 text-white" />
      </div>

      {/* Customer Info Header */}
      <div className="flex items-start gap-4 mb-4 pt-2">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-pink-100 group-hover:ring-pink-200 transition-all">
          {/* Placeholder avatar with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {name.charAt(0)}
            </span>
          </div>
          
          {/* In production, uncomment for actual image */}
          {/* <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="56px"
          /> */}
        </div>

        {/* Name and Date */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">{name}</h4>
            {verified && (
              <div className="flex items-center gap-1 text-green-600" title="Verified Purchase">
                <BadgeCheck className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>
          
          {/* Rating Stars */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{rating}.0</span>
          </div>

          {/* Date */}
          <div className="text-xs text-gray-500">{date}</div>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-gray-700 leading-relaxed mb-4">
        {displayComment}
      </p>

      {/* Read More Button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-pink-600 hover:text-pink-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}

      {/* Before/After Images (if provided) */}
      {beforeAfterImages && beforeAfterImages.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowImages(!showImages)}
            className="text-sm font-medium text-pink-600 hover:text-pink-700 mb-2"
          >
            {showImages ? 'Hide' : 'View'} Before & After Images
          </button>
          
          {showImages && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {beforeAfterImages.map((img, index) => (
                <div 
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100" />
                  {/* In production, use actual images */}
                  {/* <Image
                    src={img}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  /> */}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verified Purchase Badge */}
      {verified && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <BadgeCheck className="w-4 h-4 fill-current" />
            <span className="font-medium">Verified Purchase</span>
          </div>
        </div>
      )}

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-200 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}