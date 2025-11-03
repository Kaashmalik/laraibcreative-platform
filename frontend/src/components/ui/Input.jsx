'use client';

'use client';
import { forwardRef } from 'react';
const Input = forwardRef(({ className = '', ...props }, ref) => {
  return <input ref={ref} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
});
Input.displayName = 'Input';
export default Input;
export { Input };