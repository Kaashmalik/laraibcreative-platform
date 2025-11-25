'use client'

import { ReactNode, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps {
  children: ReactNode
  variant?: 'gold' | 'rose' | 'dark' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  glow?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

const variantStyles = {
  gold: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg shadow-gold-500/25',
  rose: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25',
  dark: 'bg-luxury-charcoal text-white hover:bg-luxury-black',
  outline: 'border-2 border-gold-500 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/20',
  ghost: 'text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/20',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      variant = 'gold',
      size = 'md',
      isLoading = false,
      disabled = false,
      glow = false,
      leftIcon,
      rightIcon,
      className,
      type = 'button',
      onClick,
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          glow && 'animate-pulse-glow',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

export default AnimatedButton
