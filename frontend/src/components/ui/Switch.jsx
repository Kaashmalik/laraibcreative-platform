
/**
 * Switch Component
 * 
 * Toggle switch with customizable appearance
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - Size: 'sm', 'md', 'lg'
 * @param {string} props.variant - Variant: 'primary', 'secondary', 'success', 'danger'
 * @param {string} props.label - Label text
 * @param {string} props.description - Description text
 * @param {string} props.labelPosition - Label position: 'left', 'right'
 * @param {ReactNode} props.icon - Icon when checked
 * @param {boolean} props.loading - Loading state
 * 
 * @example
 * <Switch
 *   checked={darkMode}
 *   onChange={setDarkMode}
 *   label="Dark Mode"
 *   icon={<Moon className="w-3 h-3" />}
 * />
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'primary',
  label,
  description,
  labelPosition = 'right',
  icon,
  loading = false,
  className = ''
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled || loading) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const sizes = {
    sm: { 
      track: 'w-8 h-4', 
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: { 
      track: 'w-11 h-6', 
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: { 
      track: 'w-14 h-7', 
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const variants = {
    primary: 'bg-[#D946A6]',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    success: 'bg-green-500',
    danger: 'bg-red-500'
  };

  const SwitchElement = (
    <button
      role="switch"
      type="button"
      aria-checked={isChecked}
      aria-label={label}
      disabled={disabled || loading}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center ${sizes[size].track}
        rounded-full transition-colors duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#D946A6] focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isChecked ? variants[variant] : 'bg-gray-300 dark:bg-gray-600'}
      `}
    >
      <span
        className={`
          inline-block ${sizes[size].thumb} rounded-full
          bg-white shadow-md transform transition-transform duration-200 ease-out
          flex items-center justify-center
          ${isChecked ? sizes[size].translate : 'translate-x-0.5'}
        `}
      >
        {loading ? (
          <div className="w-2 h-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && isChecked && (
            <span className="text-[#D946A6]">
              {icon}
            </span>
          )
        )}
      </span>
    </button>
  );

  if (!label && !description) {
    return <div className={className}>{SwitchElement}</div>;
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {labelPosition === 'left' && (
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      {SwitchElement}

      {labelPosition === 'right' && (
        <div className="flex-1">
          {label && (
            <label 
              className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  label: PropTypes.string,
  description: PropTypes.string,
  labelPosition: PropTypes.oneOf(['left', 'right']),
  icon: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string
};

// Demo Component
const Demo = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [volumeValue, setVolumeValue] = useState(75);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    { type: 'label', label: 'Account' },
    { id: 'profile', label: 'Profile', icon: User, onClick: () => console.log('Profile') },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘S' },
    { id: 'billing', label: 'Billing', icon: CreditCard, badge: 'Pro' },
    { type: 'divider' },
    { type: 'label', label: 'Content' },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: '3' },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { type: 'divider' },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'logout', label: 'Log out', icon: LogOut, danger: true, shortcut: '⇧⌘Q' }
  ];

  const actionItems = [
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'copy', label: 'Copy', icon: Copy, shortcut: '⌘C' },
    { id: 'share', label: 'Share', icon: Share2 },
    { type: 'divider' },
    { id: 'download', label: 'Download', icon: Download },
    { type: 'divider' },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
  ];

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            UI Components Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            DropdownMenu, Slider & Switch components with full functionality
          </p>
        </div>

        {/* DropdownMenu Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            DropdownMenu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Menu */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                User Menu
              </h3>
              <DropdownMenu
                trigger={
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#D946A6] text-white rounded-lg hover:bg-[#c13d95] transition-colors">
                    <User className="w-4 h-4" />
                    <span>My Account</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                }
                items={menuItems}
                width={220}
              />
            </div>

            {/* Actions Menu */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Actions Menu
              </h3>
              <DropdownMenu
                trigger={
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                }
                items={actionItems}
                align="right"
                width={180}
              />
            </div>

            {/* Custom Alignment */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Center Aligned
              </h3>
              <DropdownMenu
                trigger={
                  <button className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#D946A6] transition-colors text-gray-700 dark:text-gray-300">
                    Options
                  </button>
                }
                items={actionItems.slice(0, 4)}
                align="center"
                width={160}
              />
            </div>
          </div>
        </section>

        {/* Slider Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Slider
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Slider */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Slider
              </h3>
              <Slider
                value={sliderValue}
                onChange={setSliderValue}
                label="Progress"
                showValue
              />
            </div>

            {/* Volume Slider */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Volume Control
              </h3>
              <Slider
                value={volumeValue}
                onChange={setVolumeValue}
                label="Volume"
                showValue
                formatValue={(v) => `${v}%`}
                size="lg"
              />
            </div>

            {/* Slider with Marks */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                With Marks
              </h3>
              <Slider
                value={50}
                onChange={() => {}}
                min={0}
                max={100}
                step={25}
                marks={[
                  { value: 0, label: 'Low' },
                  { value: 50, label: 'Med' },
                  { value: 100, label: 'High' }
                ]}
              />
            </div>

            {/* Different Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Variants
              </h3>
              <div className="space-y-4">
                <Slider
                  value={70}
                  onChange={() => {}}
                  variant="success"
                  size="sm"
                />
                <Slider
                  value={40}
                  onChange={() => {}}
                  variant="danger"
                  size="sm"
                />
                <Slider
                  value={60}
                  onChange={() => {}}
                  variant="secondary"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Switch Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Switch
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Switch */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Switch
              </h3>
              <Switch
                checked={switchChecked}
                onChange={setSwitchChecked}
                label="Enable Feature"
                description="Turn this feature on or off"
              />
            </div>

            {/* Dark Mode Switch */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Dark Mode
              </h3>
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                label="Dark Mode"
                description="Toggle between light and dark theme"
                icon={darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              />
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Notifications
              </h3>
              <Switch
                checked={notifications}
                onChange={setNotifications}
                label="Push Notifications"
                description="Receive notifications about updates"
                icon={<Bell className="w-3 h-3" />}
                size="lg"
              />
            </div>

            {/* Size Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Sizes
              </h3>
              <div className="space-y-4">
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Small"
                  size="sm"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Medium"
                  size="md"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Large"
                  size="lg"
                />
              </div>
            </div>

            {/* Color Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Variants
              </h3>
              <div className="space-y-4">
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Primary"
                  variant="primary"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Success"
                  variant="success"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Danger"
                  variant="danger"
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Secondary"
                  variant="secondary"
                />
              </div>
            </div>

            {/* States */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                States
              </h3>
              <div className="space-y-4">
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Disabled On"
                  disabled
                />
                <Switch
                  checked={false}
                  onChange={() => {}}
                  label="Disabled Off"
                  disabled
                />
                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Loading"
                  loading
                />
              </div>
            </div>
          </div>
        </section>

        {/* Combined Example */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Combined Example
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Settings Panel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure your preferences
                </p>
              </div>
              <DropdownMenu
                trigger={
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                }
                items={[
                  { id: 'export', label: 'Export Settings', icon: Download },
                  { id: 'reset', label: 'Reset to Default', icon: Settings },
                  { type: 'divider' },
                  { id: 'help', label: 'Help', icon: HelpCircle }
                ]}
                align="right"
              />
            </div>

            <div className="space-y-6">
              {/* Audio Settings */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Audio
                </h4>
                <div className="space-y-4">
                  <Slider
                    value={volumeValue}
                    onChange={setVolumeValue}
                    label="Master Volume"
                    showValue
                    formatValue={(v) => `${v}%`}
                  />
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    label="Sound Effects"
                    description="Play sound effects for interactions"
                  />
                </div>
              </div>

              {/* Appearance */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Appearance
                </h4>
                <div className="space-y-4">
                  <Switch
                    checked={darkMode}
                    onChange={setDarkMode}
                    label="Dark Mode"
                    description="Use dark theme across the application"
                    icon={darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  />
                  <Slider
                    value={sliderValue}
                    onChange={setSliderValue}
                    label="UI Scale"
                    showValue
                    formatValue={(v) => `${v}%`}
                    min={80}
                    max={120}
                    step={5}
                  />
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Notifications
                </h4>
                <div className="space-y-4">
                  <Switch
                    checked={notifications}
                    onChange={setNotifications}
                    label="Push Notifications"
                    description="Receive push notifications on your device"
                    icon={<Bell className="w-3 h-3" />}
                  />
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    label="Email Notifications"
                    description="Receive notifications via email"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 px-4 py-2.5 bg-[#D946A6] text-white rounded-lg hover:bg-[#c13d95] transition-colors font-medium">
                Save Changes
              </button>
              <button className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-[#D946A6] transition-colors font-medium">
                Cancel
              </button>
            </div>
          </div>
        </section>

        {/* Component Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#D946A6] to-[#c13d95] p-6 rounded-xl text-white">
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm opacity-90">Components</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="text-3xl font-bold mb-1">100%</div>
            <div className="text-sm opacity-90">Accessible</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="text-3xl font-bold mb-1">∞</div>
            <div className="text-sm opacity-90">Customizable</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Demo;