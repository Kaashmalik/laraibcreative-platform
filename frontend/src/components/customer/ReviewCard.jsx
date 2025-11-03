'use client';

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ReviewCard Component
 * 
 * Displays customer review with:
 * - Star rating visualization
 * - Customer name and verification badge
 * - Review title and comment
 * - Review images with lightbox
 * - Helpful vote system
 * - Date formatting
 * - Verified purchase indicator
 * - Read more/less for long reviews
 * 
 * @param {Object} review - Review data object
 */
export default function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Character limit for review text
  const CHAR_LIMIT = 200;
  const needsExpansion = review.comment?.length > CHAR_LIMIT;

  /**
   * Format review date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /**
   * Render star rating
   */
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  /**
   * Handle helpful vote
   */
  const handleHelpfulVote = async () => {
    if (hasVoted) return;

    try {
      // Optimistic UI update
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);

      // API call
      const response = await fetch(`/api/reviews/${review._id}/helpful`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revert on error
        setHelpfulCount(prev => prev - 1);
        setHasVoted(false);
      }
    } catch (error) {
      console.error('Error voting:', error);
      setHelpfulCount(prev => prev - 1);
      setHasVoted(false);
    }
  };

  /**
   * Open image in lightbox
   */
  const openLightbox = (image) => {
    setLightboxImage(image);
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close lightbox
   */
  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'unset';
  };

  /**
   * Get display text based on expansion state
   */
  const getDisplayText = () => {
    if (!needsExpansion || isExpanded) {
      return review.comment;
    }
    return review.comment.substring(0, CHAR_LIMIT) + '...';
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Header with rating and date */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {renderStars(review.rating)}
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </span>
        </div>

        {/* Review title */}
        {review.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {review.title}
          </h3>
        )}

        {/* Reviewer info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {review.customer?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.customer?.fullName || 'Anonymous Customer'}
            </p>
            {review.isVerifiedPurchase && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified Purchase</span>
              </div>
            )}
          </div>
        </div>

        {/* Review comment */}
        <p className="text-gray-700 leading-relaxed mb-4">
          {getDisplayText()}
        </p>

        {/* Read more/less button */}
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium mb-4 transition-colors"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}

        {/* Review images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {review.images.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(image)}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Helpful vote section */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleHelpfulVote}
            disabled={hasVoted}
            className={`flex items-center gap-2 text-sm transition-colors ${
              hasVoted
                ? 'text-pink-600 cursor-default'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <svg 
              className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`}
              fill={hasVoted ? 'currentColor' : 'none'}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
              />
            </svg>
            <span className="font-medium">
              {hasVoted ? 'Helpful!' : 'Helpful'}
            </span>
            {helpfulCount > 0 && (
              <span className="text-gray-500">({helpfulCount})</span>
            )}
          </button>

          {/* Report button */}
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Report
          </button>
        </div>
      </div>

      {/* Lightbox for review images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage}
                alt="Review image"
                fill
                sizes="100vw"
                className="object-contain"
                quality={100}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}