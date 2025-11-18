
'use client';

/**
 * Accordion Component
 * 
 * Expandable content sections
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of accordion items [{id, title, content, icon}]
 * @param {boolean} props.multiple - Allow multiple items open
 * @param {Array} props.defaultOpen - Array of default open item ids
 * @param {string} props.variant - Style variant: 'default', 'bordered', 'separated'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Accordion
 *   items={[
 *     { id: 'faq1', title: 'How do I place an order?', content: '...' },
 *     { id: 'faq2', title: 'What is your return policy?', content: '...' }
 *   ]}
 *   multiple={false}
 * />
 */
const Accordion = ({
  items = [],
  multiple = false,
  defaultOpen = [],
  variant = 'default',
  className = ''
}) => {
  const [openItems, setOpenItems] = useState(defaultOpen);

  const toggleItem = (itemId) => {
    if (multiple) {
      setOpenItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  const variants = {
    default: {
      container: 'divide-y divide-gray-200',
      item: '',
      header: 'px-4 py-4',
      content: 'px-4 pb-4'
    },
    bordered: {
      container: 'space-y-2',
      item: 'border border-gray-200 rounded-lg',
      header: 'px-4 py-4',
      content: 'px-4 pb-4'
    },
    separated: {
      container: 'space-y-4',
      item: 'bg-white shadow-sm rounded-lg',
      header: 'px-5 py-4',
      content: 'px-5 pb-5'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={`${currentVariant.container} ${className}`}>
      {items.map(item => {
        const isOpen = openItems.includes(item.id);
        const Icon = item.icon;

        return (
          <div key={item.id} className={currentVariant.item}>
            <button
              onClick={() => toggleItem(item.id)}
              className={`
                w-full flex items-center justify-between text-left
                ${currentVariant.header}
                transition-colors hover:bg-gray-50
                ${isOpen ? 'bg-gray-50' : ''}
              `}
              aria-expanded={isOpen}
              aria-controls={`content-${item.id}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {Icon && <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                <span className="font-medium text-gray-900">{item.title}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Use Framer Motion's AnimatePresence */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key={`content-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className={`${currentVariant.content} text-gray-600`}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

/**
 * AccordionItem Component (Alternative single-item usage)
 */
const AccordionItem = ({
  title,
  children,
  icon,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = icon;

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left px-4 py-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 text-gray-600 animate-accordion-down">
          {children}
        </div>
      )}
    </div>
  );
};

// Demo Component
const TabsAccordionDemo = () => {
  const [activeAccountTab, setActiveAccountTab] = useState('orders');

  // Sample data for tabs
  const accountTabs = [
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      badge: '3',
      content: (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">#LC-2025-00{i}</h4>
                  <p className="text-sm text-gray-600">Placed on Jan {10 + i}, 2025</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Delivered
                </span>
              </div>
              <p className="text-gray-700">Embroidered Lawn Suit - 3 piece</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="font-semibold text-[#D946A6]">PKR 4,500</span>
                <button className="text-sm text-[#D946A6] hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Sara Ahmed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="sara@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+92 300 1234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                defaultValue="+92 300 1234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D946A6] focus:outline-none"
              />
            </div>
          </div>
          <button className="px-6 py-2.5 bg-[#D946A6] text-white rounded-lg hover:bg-[#C13590] transition-colors">
            Save Changes
          </button>
        </div>
      )
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#D946A6] hover:bg-purple-50 transition-colors text-gray-600 hover:text-[#D946A6]">
            + Add New Address
          </button>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">Home</h4>
              <span className="px-2 py-1 bg-[#D946A6] text-white text-xs rounded">
                Default
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              123 Main Street, Block A<br />
              Lahore, Punjab 54000<br />
              Pakistan
            </p>
            <div className="flex gap-3 mt-3">
              <button className="text-sm text-[#D946A6] hover:underline">Edit</button>
              <button className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: '5',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-158339173395${i}-6c78276477e2?w=300&h=300&fit=crop`}
                alt="Product"
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h4 className="font-medium text-gray-900 mb-1">Product {i}</h4>
                <p className="text-sm text-gray-600 mb-2">PKR 4,500</p>
                <button className="w-full px-4 py-2 bg-[#D946A6] text-white rounded-lg hover:bg-[#C13590] transition-colors text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  // Sample data for accordion
  const faqItems = [
    {
      id: 'faq1',
      title: 'How do I place a custom order?',
      content: 'To place a custom order, click on "Custom Order" in the menu, upload reference images of your desired design, select your fabric preference, provide your measurements, and add any special instructions. Our team will review your order and contact you for confirmation.'
    },
    {
      id: 'faq2',
      title: 'What measurements do I need to provide?',
      content: 'For a perfect fit, you need to provide: shirt length, shoulder width, sleeve length, bust, waist, hip, trouser length, and other relevant measurements. We have a detailed size guide with instructions on how to take accurate measurements.'
    },
    {
      id: 'faq3',
      title: 'How long does custom stitching take?',
      content: 'Standard custom orders take 7-10 business days. Express orders can be completed in 3-5 business days with additional charges. The exact timeline depends on the complexity of the design and current order volume.'
    },
    {
      id: 'faq4',
      title: 'What is your return policy?',
      content: 'We accept returns within 7 days of delivery for ready-made products. Custom-stitched items can only be returned if there is a stitching defect or measurement error on our part. All items must be unworn and in original condition.'
    },
    {
      id: 'faq5',
      title: 'Do you ship internationally?',
      content: 'Currently, we offer shipping within Pakistan to all major cities. International shipping is available on request for bulk orders. Please contact us for international shipping rates and delivery times.'
    }
  ];

  const shippingFaqs = [
    {
      id: 'ship1',
      title: 'What are the shipping charges?',
      icon: Package,
      content: 'Shipping charges vary by city: Lahore (PKR 200), Karachi/Islamabad (PKR 300), Other cities (PKR 350). Free shipping on orders above PKR 5,000.'
    },
    {
      id: 'ship2',
      title: 'How can I track my order?',
      icon: MapPin,
      content: 'Once your order is dispatched, you will receive a tracking number via SMS and email. You can also track your order by logging into your account and viewing order details.'
    },
    {
      id: 'ship3',
      title: 'Do you offer Cash on Delivery?',
      icon: CreditCard,
      content: 'Yes, Cash on Delivery (COD) is available for all orders. However, advance payment through bank transfer is encouraged for faster processing.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tabs & Accordion Components
          </h1>
          <p className="text-gray-600">
            Organize and display content in expandable and tabbed layouts
          </p>
        </div>

        {/* Tabs Demo */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Customer Account Dashboard - Default Tabs
          </h3>
          <Tabs
            tabs={accountTabs}
            defaultTab="orders"
            onChange={setActiveAccountTab}
          />
        </div>

        {/* Pills Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Pills Style Tabs
          </h3>
          <Tabs
            tabs={[
              { id: 'all', label: 'All Products', content: <div className="py-4">All products content...</div> },
              { id: 'bridal', label: 'Bridal', content: <div className="py-4">Bridal collection...</div> },
              { id: 'party', label: 'Party Wear', content: <div className="py-4">Party wear collection...</div> },
              { id: 'casual', label: 'Casual', content: <div className="py-4">Casual collection...</div> }
            ]}
            variant="pills"
          />
        </div>

        {/* Underline Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Underline Style Tabs
          </h3>
          <Tabs
            tabs={[
              { id: 'description', label: 'Description', content: <div className="py-4">Product description here...</div> },
              { id: 'specifications', label: 'Specifications', content: <div className="py-4">Fabric: Lawn, Size: Medium...</div> },
              { id: 'reviews', label: 'Reviews', badge: '12', content: <div className="py-4">Customer reviews...</div> }
            ]}
            variant="underline"
          />
        </div>

        {/* Accordion Demo */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            FAQ Accordion - Default Style
          </h3>
          <Accordion
            items={faqItems}
            multiple={false}
            defaultOpen={['faq1']}
          />
        </div>

        {/* Bordered Accordion */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Shipping FAQs - Bordered Style
          </h3>
          <Accordion
            items={shippingFaqs}
            variant="bordered"
            multiple={true}
          />
        </div>

        {/* Separated Accordion */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            Individual Accordion Items - Separated Style
          </h3>
          <div className="space-y-4">
            <AccordionItem title="How do I save my measurements?" icon={Settings}>
              After logging in, go to your account dashboard and click on "Measurements". 
              You can add multiple measurement sets and label them for easy access during checkout.
            </AccordionItem>
            
            <AccordionItem title="Can I modify my order after placing it?" icon={Package} defaultOpen>
              Yes, you can modify your order within 24 hours of placing it, provided that stitching 
              has not yet started. Please contact our support team immediately to make changes.
            </AccordionItem>
            
            <AccordionItem title="What payment methods do you accept?" icon={CreditCard}>
              We accept bank transfer, JazzCash, EasyPaisa, and Cash on Delivery (COD). 
              For bank transfers, you need to upload the payment receipt during checkout.
            </AccordionItem>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Component Features
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tabs Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  3 style variants (default, pills, underline)
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Multiple size options
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Icon and badge support
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Smooth transitions
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Keyboard navigation
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  ARIA accessible
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Accordion Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  3 style variants (default, bordered, separated)
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Single or multiple expansion
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Icon support
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Smooth expand/collapse animation
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Default open items
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Keyboard accessible
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes accordion-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        
        .animate-accordion-down {
          animation: accordion-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export { Tabs, Accordion, AccordionItem };
export default TabsAccordionDemo;