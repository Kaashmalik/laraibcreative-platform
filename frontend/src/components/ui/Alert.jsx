'use client';

/**
 * Alert Component
 * 
 * Inline alert for important messages
 * 
 * @param {Object} props
 * @param {string} props.type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Alert title
 * @param {ReactNode} props.children - Alert content
 * @param {boolean} props.dismissible - Show close button
 * @param {Function} props.onClose - Close handler
 * @param {string} props.variant - Style variant: 'filled', 'outlined', 'subtle'
 * 
 * @example
 * <Alert
 *   type="warning"
 *   title="Payment Pending"
 *   dismissible
 *   onClose={() => setShowAlert(false)}
 * >
 *   Please upload your payment receipt to proceed.
 * </Alert>
 */
const Alert = ({
  type = 'info',
  title,
  children,
  dismissible = false,
  onClose,
  variant = 'subtle',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const variants = {
    subtle: {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-orange-50 border-orange-200 text-orange-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    outlined: {
      success: 'bg-white border-2 border-green-500 text-green-800',
      error: 'bg-white border-2 border-red-500 text-red-800',
      warning: 'bg-white border-2 border-orange-500 text-orange-800',
      info: 'bg-white border-2 border-blue-500 text-blue-800'
    },
    filled: {
      success: 'bg-green-500 border-green-500 text-white',
      error: 'bg-red-500 border-red-500 text-white',
      warning: 'bg-orange-500 border-orange-500 text-white',
      info: 'bg-blue-500 border-blue-500 text-white'
    }
  };

  const iconColors = {
    subtle: {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-orange-500',
      info: 'text-blue-500'
    },
    outlined: {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-orange-500',
      info: 'text-blue-500'
    },
    filled: {
      success: 'text-white',
      error: 'text-white',
      warning: 'text-white',
      info: 'text-white'
    }
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${variants[variant][type]} ${className}
      `}
      role="alert"
    >
      <div className={iconColors[variant][type]}>
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">
            {title}
          </h4>
        )}
        {children && (
          <div className={`text-sm ${variant === 'filled' ? 'opacity-90' : 'opacity-80'}`}>
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleClose}
          className={`${variant === 'filled' ? 'opacity-80 hover:opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Demo Component
const DialogToastAlertDemo = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [largeDialog, setLargeDialog] = useState(false);
  
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [warningToast, setWarningToast] = useState(false);
  const [infoToast, setInfoToast] = useState(false);

  const Button = ({ children, onClick, variant = 'primary', size = 'md' }) => {
    const variants = {
      primary: 'bg-[#D946A6] hover:bg-[#C13590] text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      outline: 'border-2 border-[#D946A6] text-[#D946A6] hover:bg-[#D946A6] hover:text-white'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        onClick={onClick}
        className={`
          rounded-lg font-medium transition-all duration-200
          ${variants[variant]} ${sizes[size]}
        `}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Dialog, Toast & Alert Components
          </h1>
          <p className="text-gray-600">
            Feedback and modal components for user interactions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dialogs */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Dialog Modals
            </h3>
            <div className="space-y-3">
              <Button onClick={() => setDialogOpen(true)}>
                Open Basic Dialog
              </Button>
              <Button onClick={() => setConfirmDialog(true)} variant="outline">
                Open Confirmation Dialog
              </Button>
              <Button onClick={() => setLargeDialog(true)} variant="secondary">
                Open Large Dialog
              </Button>
            </div>
          </div>

          {/* Toasts */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Toast Notifications
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setSuccessToast(true)}>
                Success Toast
              </Button>
              <Button onClick={() => setErrorToast(true)}>
                Error Toast
              </Button>
              <Button onClick={() => setWarningToast(true)}>
                Warning Toast
              </Button>
              <Button onClick={() => setInfoToast(true)}>
                Info Toast
              </Button>
            </div>
          </div>

          {/* Alert Variants */}
          <div className="bg-white rounded-xl p-6 shadow-md lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Alert Variants - Subtle
            </h3>
            <div className="space-y-4">
              <Alert type="success" title="Order Confirmed" dismissible>
                Your order #LC-2025-001 has been successfully placed and payment verified.
              </Alert>
              <Alert type="error" title="Payment Failed" dismissible>
                We couldn't verify your payment receipt. Please check and upload again.
              </Alert>
              <Alert type="warning" title="Measurement Required" dismissible>
                Please provide your measurements to proceed with custom stitching.
              </Alert>
              <Alert type="info" title="Delivery Update" dismissible>
                Your order is being stitched and will be ready in 5-7 business days.
              </Alert>
            </div>
          </div>

          {/* Outlined Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Outlined Alerts
            </h3>
            <div className="space-y-4">
              <Alert type="success" variant="outlined" title="Payment Verified">
                Your bank transfer has been confirmed.
              </Alert>
              <Alert type="error" variant="outlined" title="Out of Stock">
                This fabric is currently unavailable.
              </Alert>
            </div>
          </div>

          {/* Filled Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Filled Alerts
            </h3>
            <div className="space-y-4">
              <Alert type="success" variant="filled" title="Order Delivered">
                Successfully delivered to your address.
              </Alert>
              <Alert type="warning" variant="filled" title="Rush Order">
                Additional charges apply for express delivery.
              </Alert>
            </div>
          </div>

          {/* Simple Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-md lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Simple Alerts (No Title)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Alert type="info">
                Free shipping on orders above PKR 5,000
              </Alert>
              <Alert type="warning">
                Custom orders cannot be cancelled once stitching starts
              </Alert>
            </div>
          </div>
        </div>

        {/* E-commerce Use Case */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            E-commerce Use Cases
          </h3>
          <div className="space-y-4">
            <Alert type="success" title="✨ Special Offer!" dismissible>
              Get 20% off on your first custom order. Use code: <strong>FIRST20</strong>
            </Alert>
            <Alert type="info" title="📦 Delivery Information">
              Orders placed before 2 PM are processed the same day. Estimated delivery: 5-7 business days.
            </Alert>
            <Alert type="warning" title="⚠️ Size Guide" dismissible>
              Please refer to our <a href="#" className="underline font-medium">size guide</a> for accurate measurements.
            </Alert>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dialog:</h4>
              <ul className="space-y-1">
                <li>• Multiple size variants</li>
                <li>• Backdrop click to close</li>
                <li>• ESC key to close</li>
                <li>• Custom footer content</li>
                <li>• Body scroll lock</li>
                <li>• Smooth animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Toast:</h4>
              <ul className="space-y-1">
                <li>• Auto-dismiss timer</li>
                <li>• Multiple positions</li>
                <li>• 4 notification types</li>
                <li>• Manual dismiss</li>
                <li>• Slide-in animation</li>
                <li>• Stacks automatically</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Alert:</h4>
              <ul className="space-y-1">
                <li>• 3 style variants</li>
                <li>• Dismissible option</li>
                <li>• Icon indicators</li>
                <li>• Inline content</li>
                <li>• Accessible markup</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Instances */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Product Details"
        size="md"
      >
        <div className="space-y-4">
          <img 
            src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop" 
            alt="Product" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-lg mb-2">Embroidered Lawn Suit</h3>
            <p className="text-gray-600 text-sm">
              Beautiful 3-piece embroidered lawn suit perfect for summer. Includes shirt, trouser, and dupatta. 
              Available for custom stitching with your measurements.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-2xl font-bold text-[#D946A6]">PKR 4,500</span>
            <Button onClick={() => setDialogOpen(false)}>
              Add to Cart
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title="Confirm Order"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setConfirmDialog(false);
              setSuccessToast(true);
            }}>
              Confirm Order
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to place this order? You will be redirected to payment after confirmation.
        </p>
      </Dialog>

      <Dialog
        open={largeDialog}
        onClose={() => setLargeDialog(false)}
        title="Custom Order Form"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input 
                type="tel" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea 
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none resize-none"
              placeholder="Any special requirements..."
            />
          </div>
          <Alert type="info" title="Measurement Guidelines">
            Please refer to our size guide for accurate measurements. You can save your measurements for future orders.
          </Alert>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setLargeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setLargeDialog(false)}>
              Submit Order
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast Instances */}
      <Toast
        open={successToast}
        onClose={() => setSuccessToast(false)}
        type="success"
        title="Order Placed Successfully!"
        message="Your order #LC-2025-001 has been confirmed."
        duration={3000}
        position="top-right"
      />

      <Toast
        open={errorToast}
        onClose={() => setErrorToast(false)}
        type="error"
        title="Payment Verification Failed"
        message="Please upload a valid payment receipt."
        duration={4000}
        position="top-right"
      />

      <Toast
        open={warningToast}
        onClose={() => setWarningToast(false)}
        type="warning"
        title="Incomplete Information"
        message="Please provide your measurements to continue."
        duration={3000}
        position="top-right"
      />

      <Toast
        open={infoToast}
        onClose={() => setInfoToast(false)}
        type="info"
        title="New Feature Available"
        message="You can now save multiple measurement sets!"
        duration={3000}
        position="top-right"
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export { Dialog, Toast, Alert };
export default DialogToastAlertDemo;