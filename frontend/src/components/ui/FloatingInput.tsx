'use client'

import { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  success?: boolean
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      type = 'text',
      className,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const hasValue = value !== undefined && value !== ''
    const isFloating = isFocused || hasValue
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const sizeStyles = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    }

    return (
      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl border-2 bg-white dark:bg-gray-800 px-4 pt-5 pb-2 outline-none transition-all duration-200',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : success
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                : 'border-gray-200 dark:border-gray-700 focus:border-gold-500 focus:ring-2 focus:ring-gold-200',
              sizeStyles[size],
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          <motion.label
            initial={false}
            animate={{
              y: isFloating ? -10 : 0,
              scale: isFloating ? 0.85 : 1,
              x: leftIcon ? (isFloating ? -8 : 0) : 0,
            }}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 origin-left pointer-events-none transition-colors duration-200',
              leftIcon && 'left-10',
              isFloating
                ? error
                  ? 'text-red-500'
                  : success
                  ? 'text-green-500'
                  : 'text-gold-600'
                : 'text-gray-400'
            )}
          >
            {label}
          </motion.label>

          {/* Right Icon / Password Toggle */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
            {error && <AlertCircle className="w-5 h-5 text-red-500" />}
            {success && !error && <CheckCircle className="w-5 h-5 text-green-500" />}
            {rightIcon && !error && !success && rightIcon}
          </div>
        </div>

        {/* Helper Text / Error */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                'mt-1 text-sm',
                error ? 'text-red-500' : 'text-gray-500'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'

export default FloatingInput
