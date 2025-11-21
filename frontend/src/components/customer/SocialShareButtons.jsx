"use client";

import { Facebook, Twitter, Pinterest, Share2, Link2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateShareUrls } from '@/lib/seo-config';
import { SITE_URL } from '@/lib/constants';

/**
 * Social Share Buttons Component
 * Provides sharing functionality for blog posts
 * 
 * @param {Object} props
 * @param {string} props.url - URL to share
 * @param {string} props.title - Title of the content
 * @param {string} props.description - Description of the content
 * @param {string} props.image - Image URL for sharing
 */
export default function SocialShareButtons({ 
  url, 
  title, 
  description = '', 
  image = '' 
}) {
  const [copied, setCopied] = useState(false);
  const fullUrl = url?.startsWith('http') ? url : `${SITE_URL}${url}`;
  const shareUrls = generateShareUrls(fullUrl, title, description);

  const handleShare = (platform) => {
    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-6 border-t border-b border-gray-200 my-8">
      <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
      
      <button
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
        <span className="text-sm">Facebook</span>
      </button>

      <button
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
        <span className="text-sm">Twitter</span>
      </button>

      <button
        onClick={() => handleShare('pinterest')}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        aria-label="Share on Pinterest"
      >
        <Pinterest className="w-4 h-4" />
        <span className="text-sm">Pinterest</span>
      </button>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span className="text-sm">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            <span className="text-sm">Copy Link</span>
          </>
        )}
      </button>

      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          aria-label="Share via native share"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">More</span>
        </button>
      )}
    </div>
  );
}

