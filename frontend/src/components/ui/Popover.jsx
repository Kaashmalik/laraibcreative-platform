'use client';

/**
 * Popover Component
 * 
 * Click-triggered popup with rich content
 * 
 * @param {Object} props
 * @param {ReactNode} props.trigger - Trigger element
 * @param {ReactNode} props.content - Popover content
 * @param {string} props.title - Popover title
 * @param {string} props.position - Position: 'top', 'bottom', 'left', 'right'
 * @param {boolean} props.arrow - Show arrow
 * @param {boolean} props.closeButton - Show close button
 * @param {Function} props.onClose - Close callback
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Popover
 *   trigger={<button>Click me</button>}
 *   title="Popover Title"
 *   content={<div>Rich content here</div>}
 * />
 */
const Popover = ({
  trigger,
  content,
  title,
  position = 'bottom',
  arrow = true,
  closeButton = true,
  onClose,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white'
  };

  return (
    <div className="relative inline-block">
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`
            absolute z-50 ${positions[position]}
            bg-white rounded-lg shadow-xl border border-gray-200
            min-w-[200px] max-w-[400px]
            animate-scale-up
            ${className}
          `}
          role="dialog"
        >
          {arrow && (
            <div 
              className={`
                absolute w-0 h-0 ${arrows[position]}
                border-8 border-transparent
                drop-shadow-sm
              `}
            />
          )}

          {(title || closeButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h4 className="font-semibold text-gray-900">{title}</h4>
              )}
              {closeButton && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close popover"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="p-4">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Demo Component
const TooltipPopoverDemo = () => {
  const [notificationCount] = useState(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tooltip & Popover Components
          </h1>
          <p className="text-gray-600">
            Contextual information and interactive content overlays
          </p>
        </div>

        {/* Tooltip Positions */}
        <div className="bg-white rounded-xl p-12 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-8 text-gray-900 text-center">
            Tooltip Positions
          </h3>
          <div className="flex flex-col items-center gap-12">
            <Tooltip content="This tooltip appears on top" position="top">
              <button className="px-6 py-3 bg-[#D946A6] text-white rounded-lg hover:bg-[#C13590] transition-colors">
                Hover for Top Tooltip
              </button>
            </Tooltip>

            <div className="flex items-center gap-12">
              <Tooltip content="Left tooltip" position="left">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Left
                </button>
              </Tooltip>

              <Tooltip content="Right tooltip" position="right">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Right
                </button>
              </Tooltip>
            </div>

            <Tooltip content="Bottom tooltip appears here" position="bottom">
              <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Hover for Bottom Tooltip
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Tooltip Use Cases */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Tooltip Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Icon Tooltips</h4>
              <div className="flex items-center gap-4">
                <Tooltip content="Get help and support" position="top">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HelpCircle className="w-6 h-6 text-gray-600" />
                  </button>
                </Tooltip>

                <Tooltip content="Important information" position="top">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Info className="w-6 h-6 text-blue-600" />
                  </button>
                </Tooltip>

                <Tooltip content="Warning: Check details" position="top">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </button>
                </Tooltip>

                <Tooltip content="Verified and approved" position="top">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Label Tooltips</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Stitching Price
                  </label>
                  <Tooltip content="Base price for custom stitching service" position="right">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rush Order Fee
                  </label>
                  <Tooltip content="Additional charges for orders completed within 3 days" position="right">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popover Examples */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Popover Positions
          </h3>
          <div className="flex flex-col items-center gap-12">
            <Popover
              trigger={
                <button className="px-6 py-3 bg-[#D946A6] text-white rounded-lg hover:bg-[#C13590] transition-colors">
                  Top Popover
                </button>
              }
              title="Product Information"
              position="top"
              content={
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    This is a detailed popover that can contain rich content including images, links, and formatted text.
                  </p>
                  <button className="text-[#D946A6] hover:underline font-medium">
                    Learn more →
                  </button>
                </div>
              }
            />

            <div className="flex items-center gap-12">
              <Popover
                trigger={
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Left Popover
                  </button>
                }
                title="Options"
                position="left"
                content={
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                      Edit
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                      Duplicate
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-red-50 rounded text-sm text-red-600">
                      Delete
                    </button>
                  </div>
                }
              />

              <Popover
                trigger={
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Right Popover
                  </button>
                }
                title="Quick Actions"
                position="right"
                content={
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Mark as complete</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <span className="text-sm">Report issue</span>
                    </div>
                  </div>
                }
              />
            </div>

            <Popover
              trigger={
                <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Bottom Popover
                </button>
              }
              position="bottom"
              content={
                <div className="text-sm text-gray-600">
                  Bottom positioned popover with no title and auto-close on outside click.
                </div>
              }
              closeButton={false}
            />
          </div>
        </div>

        {/* E-commerce Use Cases */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Notification Popover */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Notification Center
            </h3>
            <div className="flex justify-center">
              <Popover
                trigger={
                  <button className="relative p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <Info className="w-6 h-6 text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                }
                title="Notifications"
                position="bottom"
                content={
                  <div className="w-80 max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {[
                        { title: 'Order Delivered', msg: 'Your order #LC-2025-001 has been delivered', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500' },
                        { title: 'Payment Verified', msg: 'Payment for order #LC-2025-002 confirmed', time: '5 hours ago', icon: CheckCircle, color: 'text-green-500' },
                        { title: 'New Message', msg: 'You have a message from customer support', time: '1 day ago', icon: Info, color: 'text-blue-500' }
                      ].map((notif, i) => {
                        const Icon = notif.icon;
                        return (
                          <div key={i} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <Icon className={`w-5 h-5 ${notif.color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm">{notif.title}</h5>
                              <p className="text-xs text-gray-600 line-clamp-2">{notif.msg}</p>
                              <span className="text-xs text-gray-400 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t mt-3 pt-3">
                      <button className="w-full text-center text-sm text-[#D946A6] hover:underline font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* Product Info Popover */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Product Quick View
            </h3>
            <div className="flex justify-center">
              <Popover
                trigger={
                  <div className="cursor-pointer border-2 border-gray-200 rounded-lg p-4 hover:border-[#D946A6] transition-colors">
                    <img 
                      src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop"
                      alt="Product"
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm font-medium text-center">Embroidered Suit</p>
                  </div>
                }
                title="Quick View"
                position="right"
                content={
                  <div className="w-72 space-y-3">
                    <img 
                      src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop"
                      alt="Product"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Embroidered Lawn Suit</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        3-piece lawn suit with intricate embroidery. Perfect for summer occasions.
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xl font-bold text-[#D946A6]">PKR 4,500</span>
                      <button className="px-4 py-2 bg-[#D946A6] text-white rounded-lg hover:bg-[#C13590] transition-colors text-sm">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Component Features
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tooltip Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  4 position options (top, bottom, left, right)
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Configurable show delay
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Arrow indicators
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Fade-in animation
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  ARIA accessible
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Popover Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Click-triggered interaction
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Rich content support
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Click outside to close
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  ESC key to dismiss
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Optional close button
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export { Tooltip, Popover };
export default TooltipPopoverDemo;