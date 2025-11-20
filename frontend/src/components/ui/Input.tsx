'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return <input ref={ref} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
});
Input.displayName = 'Input';
export default Input;
export { Input };