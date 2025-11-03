'use client';

'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * NewsletterForm Component
 * Email subscription form with validation and feedback
 * Features:
 * - Email validation
 * - Loading states
 * - Success/error messages
 * - Animated feedback
 * - Prevents duplicate submissions
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  /**
   * Validate email format
   */
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validation
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Set loading state
    setStatus('loading');
    setMessage('');

    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      setStatus('success');
      setMessage('Thank you for subscribing! Check your email for confirmation.');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      
      // Reset error after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* Input Group */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your email address"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
              status === 'error'
                ? 'bg-red-50 ring-2 ring-red-300 focus:ring-red-200'
                : status === 'success'
                ? 'bg-green-50 ring-2 ring-green-300'
                : 'bg-white ring-2 ring-white focus:ring-pink-200'
            }`}
            aria-label="Email address"
            aria-invalid={status === 'error'}
            aria-describedby={message ? 'newsletter-message' : undefined}
          />

          {/* Status Icon */}
          {status === 'success' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-600 animate-shake" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === 'loading' || status === 'success'}
          className={`w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            status === 'success'
              ? 'bg-green-600 text-white cursor-not-allowed'
              : status === 'loading'
              ? 'bg-pink-400 text-white cursor-wait'
              : 'bg-white text-pink-600 hover:bg-pink-50 hover:scale-105 active:scale-95'
          }`}
          aria-label="Subscribe to newsletter"
        >
          {status === 'loading' ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Subscribing...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Subscribed!
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>

        {/* Feedback Message */}
        {message && (
          <div
            id="newsletter-message"
            className={`text-center text-sm font-medium animate-fade-in ${
              status === 'error' ? 'text-red-100' : 'text-green-100'
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-sm text-pink-100 mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes shake {
          0%, 100% { 
            transform: translateX(0); 
          }
          25% { 
            transform: translateX(-5px); 
          }
          75% { 
            transform: translateX(5px); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}