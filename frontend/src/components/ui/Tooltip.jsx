import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Info, HelpCircle, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Tooltip Component
 * 
 * Hover tooltip for additional information
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Trigger element
 * @param {string|ReactNode} props.content - Tooltip content
 * @param {string} props.position - Position: 'top', 'bottom', 'left', 'right'
 * @param {number} props.delay - Show delay in ms
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Tooltip content="This is a helpful tooltip" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positions[position]}
            px-3 py-2 text-sm text-white bg-gray-900 rounded-lg
            shadow-lg whitespace-nowrap animate-fade-in
            ${className}
          `}
          role="tooltip"
        >
          {content}
          <div 
            className={`
              absolute w-0 h-0 ${arrows[position]}
              border-4 border-transparent
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  className: PropTypes.string
};

Tooltip.defaultProps = {
  position: 'top',
  delay: 200,
  className: ''
};
