
/**
 * Slider Component
 * 
 * Range slider with customizable appearance and behavior
 * 
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step increment
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.showValue - Show current value
 * @param {string} props.variant - Variant: 'primary', 'secondary', 'success', 'danger'
 * @param {string} props.size - Size: 'sm', 'md', 'lg'
 * @param {string} props.label - Label text
 * @param {Function} props.formatValue - Value formatter function
 * @param {Array} props.marks - Array of mark objects with value and label
 * 
 * @example
 * <Slider
 *   value={volume}
 *   onChange={setVolume}
 *   min={0}
 *   max={100}
 *   label="Volume"
 *   showValue
 *   formatValue={(v) => `${v}%`}
 * />
 */
const Slider = ({
  value = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  variant = 'primary',
  size = 'md',
  label,
  formatValue,
  marks = [],
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  const variants = {
    primary: 'bg-[#D946A6]',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    success: 'bg-green-500',
    danger: 'bg-red-500'
  };

  const sizes = {
    sm: { track: 'h-1', thumb: 'w-3 h-3' },
    md: { track: 'h-2', thumb: 'w-4 h-4' },
    lg: { track: 'h-3', thumb: 'w-5 h-5' }
  };

  const handleChange = (e) => {
    if (disabled) return;
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const displayValue = formatValue ? formatValue(localValue) : localValue;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-[#D946A6]">
              {displayValue}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div
          ref={sliderRef}
          className={`
            relative w-full ${sizes[size].track} rounded-full
            bg-gray-200 dark:bg-gray-700
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Progress Track */}
          <div
            className={`
              absolute top-0 left-0 h-full rounded-full
              transition-all duration-200 ease-out
              ${variants[variant]}
              ${isDragging ? 'transition-none' : ''}
            `}
            style={{ width: `${percentage}%` }}
          />

          {/* Marks */}
          {marks.length > 0 && (
            <div className="absolute top-0 left-0 w-full h-full">
              {marks.map((mark, index) => {
                const markPercentage = ((mark.value - min) / (max - min)) * 100;
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${markPercentage}%` }}
                  >
                    <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
                    {mark.label && (
                      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Input Range */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            disabled={disabled}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={localValue}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />

          {/* Thumb */}
          <div
            className={`
              absolute top-1/2 -translate-y-1/2 ${sizes[size].thumb}
              ${variants[variant]} rounded-full
              shadow-md transition-all duration-200 ease-out
              ${isDragging ? 'scale-110 shadow-lg' : 'scale-100'}
              ${!disabled && 'hover:scale-110'}
              pointer-events-none
            `}
            style={{ left: `calc(${percentage}% - ${parseInt(sizes[size].thumb.split(' ')[0].slice(2)) / 2}px)` }}
          >
            <div className="absolute inset-0 rounded-full bg-white opacity-20" />
          </div>
        </div>

        {/* Min/Max Labels */}
        {(min !== 0 || max !== 100) && (
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatValue ? formatValue(min) : min}</span>
            <span>{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
      </div>
    </div>
  );
};

Slider.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  disabled: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  formatValue: PropTypes.func,
  marks: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string
  })),
  className: PropTypes.string
};
