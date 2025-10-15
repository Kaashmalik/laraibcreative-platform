import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronDown, User, Settings, LogOut, Package, Heart, 
  MapPin, CreditCard, Bell, HelpCircle, Edit, Trash2, 
  Copy, Share2, Download, Eye, MoreVertical, MoreHorizontal,
  Check, Moon, Sun
} from 'lucide-react';

/**
 * DropdownMenu Component
 * 
 * Customizable dropdown menu with icons, dividers, and keyboard navigation
 * 
 * @param {Object} props
 * @param {ReactNode} props.trigger - Trigger element
 * @param {Array} props.items - Menu items array
 * @param {string} props.align - Alignment: 'left', 'right', 'center'
 * @param {string} props.position - Position: 'bottom', 'top'
 * @param {number} props.width - Menu width in pixels
 * @param {Function} props.onSelect - Item select handler
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <DropdownMenu
 *   trigger={<button>Options</button>}
 *   items={[
 *     { id: 'edit', label: 'Edit', icon: Edit, onClick: handleEdit },
 *     { type: 'divider' },
 *     { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
 *   ]}
 * />
 */
const DropdownMenu = ({
  trigger,
  items = [],
  align = 'left',
  position = 'bottom',
  width = 200,
  onSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuItems = items.filter(item => item.type !== 'divider');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < menuItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : menuItems.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            handleItemClick(menuItems[focusedIndex]);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, menuItems]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="menuitem"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleItemClick = (item) => {
    if (item.disabled) return;
    
    item.onClick?.();
    onSelect?.(item.id);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  const positions = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2'
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          style={{ width: `${width}px` }}
          className={`
            absolute z-50 ${positions[position]} ${alignments[align]}
            bg-white dark:bg-gray-800 rounded-xl
            shadow-lg border border-gray-200 dark:border-gray-700
            py-1 max-h-96 overflow-y-auto
            animate-in fade-in slide-in-from-top-2 duration-200
            ${className}
          `}
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  className="h-px bg-gray-200 dark:bg-gray-700 my-1"
                  role="separator"
                />
              );
            }

            if (item.type === 'label') {
              return (
                <div
                  key={`label-${index}`}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;
            const itemIndex = menuItems.indexOf(item);
            const isFocused = itemIndex === focusedIndex;

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setFocusedIndex(itemIndex)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5
                  text-sm text-left transition-colors duration-200
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                  ${item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${isFocused && !item.disabled
                    ? item.danger
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                    : ''
                  }
                `}
              >
                {Icon && (
                  <Icon className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.shortcut && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {item.shortcut}
                  </span>
                )}
                {item.checked && (
                  <Check className="w-4 h-4 text-[#D946A6]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

DropdownMenu.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.elementType,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    danger: PropTypes.bool,
    badge: PropTypes.string,
    shortcut: PropTypes.string,
    checked: PropTypes.bool,
    type: PropTypes.oneOf(['divider', 'label'])
  })).isRequired,
  align: PropTypes.oneOf(['left', 'right', 'center']),
  position: PropTypes.oneOf(['bottom', 'top']),
  width: PropTypes.number,
  onSelect: PropTypes.func,
  className: PropTypes.string
};
