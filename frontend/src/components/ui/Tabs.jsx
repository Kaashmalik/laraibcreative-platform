import React, { useState } from 'react';
import { ChevronDown, Package, User, Settings, CreditCard, MapPin, Heart } from 'lucide-react';

/**
 * Tabs Component
 * 
 * Tabbed interface for organizing content
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects [{id, label, icon, content}]
 * @param {string} props.defaultTab - Default active tab id
 * @param {Function} props.onChange - Tab change handler
 * @param {string} props.variant - Style variant: 'default', 'pills', 'underline'
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Tabs
 *   tabs={[
 *     { id: 'orders', label: 'Orders', icon: Package, content: <OrderList /> },
 *     { id: 'profile', label: 'Profile', icon: User, content: <Profile /> }
 *   ]}
 *   defaultTab="orders"
 * />
 */
const Tabs = ({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizes = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-5 py-3'
  };

  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 transition-colors duration-200',
      active: 'border-[#D946A6] text-[#D946A6]',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'rounded-md transition-all duration-200',
      active: 'bg-white text-[#D946A6] shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900'
    },
    underline: {
      container: 'space-x-8',
      tab: 'border-b-2 transition-colors duration-200 pb-3',
      active: 'border-[#D946A6] text-[#D946A6]',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900'
    }
  };

  const currentVariant = variants[variant];
  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex ${currentVariant.container}`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 font-medium
                ${sizes[size]}
                ${currentVariant.tab}
                ${isActive ? currentVariant.active : currentVariant.inactive}
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div 
        className="mt-6"
        role="tabpanel"
        id={`panel-${activeTab}`}
      >
        {activeContent}
      </div>
    </div>
  );
};
