'use client';

import { forwardRef } from 'react';

const Checkbox = forwardRef(({ className = '', label, helperText, error, ...props }, ref) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          ref={ref} 
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`} 
          {...props} 
        />
        {label && (
          <label className="text-sm text-gray-700">{label}</label>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 ml-6">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500 ml-6">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
export { Checkbox };