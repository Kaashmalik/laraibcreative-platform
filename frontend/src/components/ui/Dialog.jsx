'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Dialog Component
 * 
 * Modal dialog with backdrop and animations
 * 
 * @param {Object} props
 * @param {boolean} props.open - Open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Dialog title
 * @param {ReactNode} props.children - Dialog content
 * @param {ReactNode} props.footer - Footer content (buttons)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.closeOnBackdrop - Close on backdrop click
 * @param {boolean} props.showClose - Show close button
 * 
 * @example
 * <Dialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Order"
 *   footer={<Button onClick={handleConfirm}>Confirm</Button>}
 * >
 *   Are you sure you want to place this order?
 * </Dialog>
 */
const Dialog = ({
  open = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
  className = ''
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]}
            animate-scale-up ${className}
          `}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              {showClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
export { Dialog };
