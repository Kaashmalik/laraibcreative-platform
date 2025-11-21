"use client";

import { Facebook, Twitter, Share2, Link2, Copy, Check } from 'lucide-react';
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
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.403.041-3.44.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
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

