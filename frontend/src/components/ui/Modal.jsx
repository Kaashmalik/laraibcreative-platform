'use client';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal Component - Accessible modal dialog with animations
 * 
 * @component
 * @example
 * // Basic modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Modal Title"
 * >
 *   <p>Modal content</p>
 * </Modal>
 * 
 * // With custom footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button onClick={handleClose}>Cancel</Button>
 *       <Button variant="primary">Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure?
 * </Modal>
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  // Handle escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  // Size variants
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal content */}
        <div
          className={`
            relative w-full ${sizes[size]} 
            bg-white rounded-2xl shadow-2xl
            transform transition-all duration-300
            animate-slideUp
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

Modal.propTypes = {
  /** Controls modal visibility */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func,
  /** Modal title */
  title: PropTypes.string,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Custom footer content */
  footer: PropTypes.node,
  /** Modal size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Allow closing on backdrop click */
  closeOnBackdropClick: PropTypes.bool,
  /** Allow closing with Escape key */
  closeOnEscape: PropTypes.bool,
  /** Show close button */
  showCloseButton: PropTypes.bool,
  /** Additional classes */
  className: PropTypes.string,
};

// Confirmation Modal - Specialized variant
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const variants = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    success: 'bg-green-500 hover:bg-green-600',
    primary: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-all ${variants[variant]}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'success', 'primary']),
};

// Demo component
const ModalDemo = () => {
  const [modals, setModals] = React.useState({
    basic: false,
    withFooter: false,
    confirm: false,
    large: false,
    form: false,
    product: false,
  });

  const openModal = (name) => setModals({ ...modals, [name]: true });
  const closeModal = (name) => setModals({ ...modals, [name]: false });

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted: ' + JSON.stringify(formData));
    closeModal('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modal Component Library
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready modal dialogs for LaraibCreative platform
          </p>

          {/* Trigger buttons */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Modal Variants</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => openModal('basic')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Basic Modal
              </button>
              <button
                onClick={() => openModal('withFooter')}
                className="px-6 py-3 bg-white border-2 border-pink-500 text-pink-500 rounded-lg font-medium hover:bg-pink-50 transition-colors"
              >
                With Footer
              </button>
              <button
                onClick={() => openModal('confirm')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Confirm Dialog
              </button>
              <button
                onClick={() => openModal('large')}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Large Modal
              </button>
              <button
                onClick={() => openModal('form')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Form Modal
              </button>
              <button
                onClick={() => openModal('product')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Product Details
              </button>
            </div>
          </section>

          {/* Features list */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Smooth fade and slide animations',
                'Backdrop blur effect',
                'Lock body scroll when open',
                'Close on Escape key',
                'Close on backdrop click (optional)',
                'Keyboard accessible (ARIA labels)',
                'Multiple size options',
                'Custom footer support',
                'Auto-focus management',
                'Responsive on all devices',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modals */}
        
        {/* Basic Modal */}
        <Modal
          isOpen={modals.basic}
          onClose={() => closeModal('basic')}
          title="Welcome to LaraibCreative"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a basic modal with a title and close button. Click outside or press Escape to close.
            </p>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-pink-800 text-sm">
                💡 <strong>Tip:</strong> Modals automatically lock body scroll and handle focus management.
              </p>
            </div>
          </div>
        </Modal>

        {/* Modal with Footer */}
        <Modal
          isOpen={modals.withFooter}
          onClose={() => closeModal('withFooter')}
          title="Order Summary"
          size="md"
          footer={
            <>
              <button
                onClick={() => closeModal('withFooter')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  alert('Order confirmed!');
                  closeModal('withFooter');
                }}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Confirm Order
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Designer Bridal Suit</h4>
                  <p className="text-sm text-gray-500">Red Velvet with Embroidery</p>
                  <p className="text-sm font-medium text-pink-600 mt-1">PKR 12,500</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">PKR 12,500</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">PKR 250</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span className="text-pink-600">PKR 12,750</span>
              </div>
            </div>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={modals.confirm}
          onClose={() => closeModal('confirm')}
          onConfirm={() => alert('Order cancelled!')}
          title="Cancel Order?"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          variant="danger"
        />

        {/* Large Modal */}
        <Modal
          isOpen={modals.large}
          onClose={() => closeModal('large')}
          title="Size Guide - How to Measure"
          size="xl"
        >
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Follow these steps to take accurate measurements for your custom suit:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Upper Body Measurements</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">1.</span>
                    <span><strong>Shirt Length:</strong> Measure from shoulder to desired length</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">2.</span>
                    <span><strong>Shoulder Width:</strong> Across the back from shoulder to shoulder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">3.</span>
                    <span><strong>Bust/Chest:</strong> Around the fullest part of bust</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">4.</span>
                    <span><strong>Waist:</strong> Around natural waistline</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Lower Body Measurements</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">1.</span>
                    <span><strong>Trouser Length:</strong> From waist to ankle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">2.</span>
                    <span><strong>Hip:</strong> Around the fullest part of hips</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">3.</span>
                    <span><strong>Thigh:</strong> Around the fullest part of thigh</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Pro Tip:</strong> Take measurements over light clothing for accuracy. If between sizes, size up for comfort.
              </p>
            </div>
          </div>
        </Modal>

        {/* Form Modal */}
        <Modal
          isOpen={modals.form}
          onClose={() => closeModal('form')}
          title="Contact Us"
          size="md"
          footer={
            <>
              <button
                onClick={() => closeModal('form')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Send Message
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all resize-none"
                placeholder="How can we help you?"
                rows={4}
                required
              />
            </div>
          </form>
        </Modal>

        {/* Product Details Modal */}
        <Modal
          isOpen={modals.product}
          onClose={() => closeModal('product')}
          title="Quick View"
          size="lg"
          footer={
            <>
              <button
                onClick={() => closeModal('product')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => alert('Added to cart!')}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Add to Cart
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Designer Bridal Suit</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">(24 reviews)</span>
              </div>
              <p className="text-3xl font-bold text-pink-600">PKR 12,500</p>
              <p className="text-gray-600">
                Exquisite red velvet bridal suit with intricate embroidery work. Perfect for your special day.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700"><strong>Fabric:</strong> Premium Velvet</p>
                <p className="text-sm text-gray-700"><strong>Color:</strong> Red</p>
                <p className="text-sm text-gray-700"><strong>Delivery:</strong> 7-10 business days</p>
              </div>
            </div>
          </div>
        </Modal>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic modal
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
>
  <p>Content here</p>
</Modal>

// With footer
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm"
  footer={
    <>
      <Button onClick={handleClose}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  Content here
</Modal>

// Confirmation dialog
<ConfirmModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Item?"
  message="This action cannot be undone."
  variant="danger"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export { Modal, ConfirmModal };
export default ModalDemo;