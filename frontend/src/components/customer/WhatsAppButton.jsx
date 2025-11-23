'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

/**
 * WhatsAppButton Component
 * Floating WhatsApp contact button with tooltip
 * Features:
 * - Floating action button (FAB)
 * - Pulse animation to attract attention
 * - Tooltip with message
 * - Smooth animations
 * - Mobile responsive
 * - Opens WhatsApp chat in new window
 */
export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // WhatsApp business number (replace with actual number)
  const whatsappNumber = '923020718182'; // Format: country code + number (no + or spaces)
  const defaultMessage = 'Hi! I\'m interested in LaraibCreative products';

  // Show button after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Show tooltip after 3 seconds for first-time visitors
      setTimeout(() => setShowTooltip(true), 3000);
      // Hide tooltip after 8 seconds
      setTimeout(() => setShowTooltip(false), 8000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Open WhatsApp chat
   */
  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Close tooltip manually
   */
  const closeTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-4 animate-bounce-in">
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 pr-10 max-w-xs border border-gray-100">
              {/* Close Button */}
              <button
                onClick={closeTooltip}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Message */}
              <div className="pr-4">
                <div className="font-semibold text-gray-900 mb-1">
                  Need Help? 💬
                </div>
                <p className="text-sm text-gray-600">
                  Chat with us on WhatsApp for instant support!
                </p>
              </div>

              {/* Arrow pointer */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45" />
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setTimeout(() => setShowTooltip(false), 2000)}
          className="group relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          
          {/* WhatsApp Icon */}
          <MessageCircle className="w-8 h-8 text-white relative z-10" />

          {/* Notification Badge (optional - for unread messages) */}
          {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
            1
          </div> */}
        </button>

        {/* Text Label (shows on hover on desktop) */}
        <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            Chat with us
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          70% {
            transform: scale(0.95) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}