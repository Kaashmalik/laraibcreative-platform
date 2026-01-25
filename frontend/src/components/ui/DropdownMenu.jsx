'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

function DropdownMenu({ trigger, children, align = 'right', stopPropagation = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const padding = 8;

    let left = triggerRect.left;

    if (align === 'right') {
      left = triggerRect.right - menuRect.width;
    } else if (align === 'center') {
      left = triggerRect.left + triggerRect.width / 2 - menuRect.width / 2;
    }

    // Keep within viewport
    left = Math.max(padding, Math.min(left, viewportWidth - menuRect.width - padding));

    const top = triggerRect.bottom + 8;

    setMenuPosition({ top, left });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleResize = () => updateMenuPosition();
    const handleScroll = () => updateMenuPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

  const handleTriggerClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMenuClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          role="menu"
          onClick={handleMenuClick}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>{children}</div>
        </div>,
        document.body
      )}
    </div>
  );
}

function DropdownMenuItem({ children, onClick, className = '' }) {
  return (
    <button onClick={onClick} className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}>
      {children}
    </button>
  );
}

export default DropdownMenu;
export { DropdownMenu, DropdownMenuItem };
