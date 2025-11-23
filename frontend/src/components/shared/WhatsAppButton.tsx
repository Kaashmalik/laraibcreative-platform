/**
 * WhatsApp Floating Button Component
 * Context-aware WhatsApp button with pre-filled messages
 */

'use client';


import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  className?: string;
}

export default function WhatsAppButton({ 
  phoneNumber = '923020718182',
  className = '' 
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Get context-aware message based on current page
  const getMessage = () => {
    if (pathname?.includes('/products/')) {
      const productName = document.querySelector('h1')?.textContent || 'this product';
      return `Hi! I'm interested in ${productName}. Can you tell me more about it?`;
    }
    
    if (pathname?.includes('/custom-order')) {
      return 'Hi! I need help with my custom order. Can you assist me?';
    }
    
    if (pathname?.includes('/cart')) {
      return 'Hi! I have items in my cart and need assistance with my order.';
    }
    
    if (pathname?.includes('/account/orders/')) {
      const orderNumber = pathname.split('/').pop();
      return `Hi! I want to check the status of my order #${orderNumber}.`;
    }
    
    // Default message
    return 'Hi! I\'m interested in your custom tailoring services. Can you help me?';
  };

  const handleClick = () => {
    const message = encodeURIComponent(getMessage());
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center ${className}`}
        aria-label="Open WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Quick Actions Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl p-4 w-64 animate-in slide-in-from-bottom-4">
          <h3 className="font-semibold text-gray-900 mb-3">Chat with us</h3>
          <button
            onClick={handleClick}
            className="w-full bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20BA5A] transition-colors mb-2"
          >
            Start Chat
          </button>
          <p className="text-xs text-gray-500 text-center">
            We typically reply within minutes
          </p>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

