'use client'

import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: 'light' | 'dark' | 'gold'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  hover?: boolean
}

const variantStyles = {
  light: 'bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/30',
  dark: 'bg-gray-900/80 dark:bg-black/80 border-gray-700/30 text-white',
  gold: 'bg-gradient-to-br from-gold-50/80 to-champagne-50/80 border-gold-200/30',
}

const blurStyles = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
}

export function GlassCard({
  children,
  variant = 'light',
  blur = 'lg',
  glow = false,
  hover = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border shadow-lg',
        variantStyles[variant],
        blurStyles[blur],
        glow && 'shadow-gold-500/20',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
