'use client';


/**
 * Radio Component
 * 
 * Custom radio button for single selection from group
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.value - Radio value
 * @param {string} props.name - Radio group name
 * @param {string} props.label - Radio label
 * @param {string} props.description - Description text below label
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Radio
 *   checked={paymentMethod === 'bank'}
 *   onChange={() => setPaymentMethod('bank')}
 *   value="bank"
 *   name="payment"
 *   label="Bank Transfer"
 *   description="Manual bank transfer with receipt"
 * />
 */
const Radio = ({
  checked = false,
  onChange,
  value,
  name,
  label,
  description,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <label 
      className={`flex items-start cursor-pointer group ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center flex-shrink-0">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          value={value}
          name={name}
          disabled={disabled}
          className="sr-only"
          aria-invalid={error}
          {...props}
        />
        <div
          className={`
            ${sizeClasses[size]} rounded-full border-2 transition-all duration-200
            flex items-center justify-center
            ${checked
              ? 'bg-[#D946A6] border-[#D946A6]'
              : error
              ? 'border-red-500 bg-white'
              : 'border-gray-300 bg-white group-hover:border-[#D946A6]'
            }
            ${!disabled && 'group-hover:shadow-sm'}
            focus-within:ring-2 focus-within:ring-[#D946A6] focus-within:ring-offset-2
          `}
        >
          {checked && (
            <div className={`${dotSizeClasses[size]} bg-white rounded-full`} />
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <span className={`${labelSizeClasses[size]} font-medium text-gray-900 block`}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500 block mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

/**
 * RadioGroup Component
 * 
 * Wrapper for managing radio button groups
 */
const RadioGroup = ({ children, value, onChange, name, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`} role="radiogroup">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onChange(child.props.value),
            name: name || 'radio-group',
          });
        }
        return child;
      })}
    </div>
  );
};

// Demo Component
const CheckboxRadioDemo = () => {
  const [agreed, setAgreed] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true
  });
  const [allSelected, setAllSelected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [fabricType, setFabricType] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');

  const handleSelectAll = () => {
    const newState = !allSelected;
    setAllSelected(newState);
    setNotifications({
      email: newState,
      sms: newState,
      whatsapp: newState
    });
  };

  const handleNotificationChange = (key, value) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    
    const allChecked = Object.values(newNotifications).every(v => v);
    setAllSelected(allChecked);
  };

  const selectedCount = Object.values(notifications).filter(Boolean).length;
  const isIndeterminate = selectedCount > 0 && selectedCount < 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Checkbox & Radio Components
          </h1>
          <p className="text-gray-600">
            Custom form controls with accessible and beautiful design
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Checkboxes */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Basic Checkboxes
            </h3>
            <div className="space-y-4">
              <Checkbox
                checked={agreed}
                onChange={setAgreed}
                label="I agree to terms and conditions"
                description="Please read our terms before proceeding"
              />
              <Checkbox
                checked={newsletter}
                onChange={setNewsletter}
                label="Subscribe to newsletter"
                description="Get updates about new collections and offers"
              />
            </div>
          </div>

          {/* Checkbox Sizes */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Checkbox Sizes
            </h3>
            <div className="space-y-4">
              <Checkbox
                checked={true}
                label="Small checkbox"
                size="sm"
              />
              <Checkbox
                checked={true}
                label="Medium checkbox (default)"
                size="md"
              />
              <Checkbox
                checked={true}
                label="Large checkbox"
                size="lg"
              />
            </div>
          </div>

          {/* Indeterminate Checkbox */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Indeterminate State
            </h3>
            <div className="space-y-3">
              <Checkbox
                checked={allSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                label="Select all notifications"
                description="Enable or disable all notification types"
              />
              <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                <Checkbox
                  checked={notifications.email}
                  onChange={(val) => handleNotificationChange('email', val)}
                  label="Email notifications"
                />
                <Checkbox
                  checked={notifications.sms}
                  onChange={(val) => handleNotificationChange('sms', val)}
                  label="SMS notifications"
                />
                <Checkbox
                  checked={notifications.whatsapp}
                  onChange={(val) => handleNotificationChange('whatsapp', val)}
                  label="WhatsApp notifications"
                />
              </div>
            </div>
          </div>

          {/* Checkbox States */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Checkbox States
            </h3>
            <div className="space-y-4">
              <Checkbox
                checked={false}
                label="Unchecked checkbox"
              />
              <Checkbox
                checked={true}
                label="Checked checkbox"
              />
              <Checkbox
                checked={false}
                disabled
                label="Disabled checkbox"
              />
              <Checkbox
                checked={true}
                disabled
                label="Checked & disabled"
              />
              <Checkbox
                checked={false}
                error
                label="Error state checkbox"
                description="This field has an error"
              />
            </div>
          </div>

          {/* Basic Radio Buttons */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Radio Group - Payment Method
            </h3>
            <RadioGroup value={paymentMethod} onChange={setPaymentMethod} name="payment">
              <Radio
                value="bank"
                label="Bank Transfer"
                description="Manual transfer with receipt upload"
              />
              <Radio
                value="jazzcash"
                label="JazzCash"
                description="Mobile wallet payment"
              />
              <Radio
                value="easypaisa"
                label="EasyPaisa"
                description="Quick mobile payment"
              />
              <Radio
                value="cod"
                label="Cash on Delivery"
                description="Pay when you receive the order"
              />
            </RadioGroup>
            <p className="mt-4 text-sm text-gray-600">
              Selected: <span className="font-medium text-[#D946A6]">{paymentMethod}</span>
            </p>
          </div>

          {/* Radio Sizes */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Radio Sizes
            </h3>
            <div className="space-y-4">
              <Radio
                checked={true}
                label="Small radio"
                size="sm"
              />
              <Radio
                checked={true}
                label="Medium radio (default)"
                size="md"
              />
              <Radio
                checked={true}
                label="Large radio"
                size="lg"
              />
            </div>
          </div>

          {/* Radio States */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Radio States
            </h3>
            <div className="space-y-4">
              <Radio
                checked={false}
                label="Unselected radio"
              />
              <Radio
                checked={true}
                label="Selected radio"
              />
              <Radio
                checked={false}
                disabled
                label="Disabled radio"
              />
              <Radio
                checked={true}
                disabled
                label="Selected & disabled"
              />
              <Radio
                checked={false}
                error
                label="Error state radio"
                description="This field has an error"
              />
            </div>
          </div>

          {/* Fabric Selection Example */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Fabric Type Selection
            </h3>
            <RadioGroup value={fabricType} onChange={setFabricType} name="fabric">
              <Radio
                value="lawn"
                label="Lawn"
                description="Light and breathable, perfect for summer"
              />
              <Radio
                value="chiffon"
                label="Chiffon"
                description="Elegant and flowy fabric for special occasions"
              />
              <Radio
                value="silk"
                label="Silk"
                description="Luxurious and smooth premium fabric"
              />
              <Radio
                value="velvet"
                label="Velvet"
                description="Rich texture for winter collections"
              />
            </RadioGroup>
          </div>
        </div>

        {/* E-commerce Use Case */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Checkout Form Example
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Shipping Method</h4>
              <RadioGroup value={shippingMethod} onChange={setShippingMethod} name="shipping">
                <Radio
                  value="standard"
                  label="Standard Delivery (5-7 days)"
                  description="Free shipping on orders over PKR 5,000"
                />
                <Radio
                  value="express"
                  label="Express Delivery (2-3 days)"
                  description="Additional PKR 300"
                />
                <Radio
                  value="overnight"
                  label="Overnight Delivery"
                  description="Additional PKR 500"
                />
              </RadioGroup>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Additional Options</h4>
              <div className="space-y-3">
                <Checkbox
                  label="Gift wrapping"
                  description="Add beautiful gift packaging (+PKR 200)"
                />
                <Checkbox
                  label="Include greeting card"
                  description="Add a personalized message"
                />
                <Checkbox
                  label="SMS delivery updates"
                  description="Get real-time order status"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Checkbox Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Indeterminate state for parent checkboxes
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Multiple size variants (sm, md, lg)
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Label and description support
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Smooth animations and transitions
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Radio Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  RadioGroup wrapper for easy management
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Accessible with proper ARIA attributes
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Keyboard navigation support
                </li>
                <li className="flex items-start">
                  <span className="text-[#D946A6] mr-2">✓</span>
                  Error and disabled states
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Checkbox, Radio, RadioGroup };
export default CheckboxRadioDemo;