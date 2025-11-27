'use client'

/**
 * Checkout Wizard Component - Phase 4-5
 * Multi-step checkout process
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Truck, CreditCard, ClipboardCheck, Scissors } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { createNewOrder, calculateShipping, type CheckoutData } from '@/app/actions/orders'
import { cn } from '@/lib/utils'

// Step components (to be created separately)
import { ShippingStep } from './ShippingStep'
import { StitchingStep } from './StitchingStep'
import { PaymentStep } from './PaymentStep'
import { ReviewStep } from './ReviewStep'

type Step = 'shipping' | 'stitching' | 'payment' | 'review'

interface StepConfig {
  id: Step
  title: string
  icon: React.ElementType
}

export function CheckoutWizard() {
  const { items, getSubtotal, getStitchingTotal, clearCart } = useCartStore()
  
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null)
  
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    items: items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.product.salePrice || item.product.price,
      totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
      isStitched: item.customization?.isStitched || false,
      stitchingPrice: item.customization?.isStitched ? (item.product.stitchingPrice || 0) : 0,
      measurements: undefined,
      customization: item.customization as Record<string, string> | undefined,
      productSnapshot: {
        title: item.product.title,
        image: item.product.image,
        price: item.product.price,
      },
    })),
    subtotal: getSubtotal(),
    stitchingFee: getStitchingTotal(),
    discountAmount: 0,
  })

  const hasStitchedItems = items.some(item => item.customization?.isStitched)

  const steps: StepConfig[] = [
    { id: 'shipping', title: 'Shipping', icon: Truck },
    ...(hasStitchedItems ? [{ id: 'stitching' as Step, title: 'Stitching', icon: Scissors }] : []),
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'review', title: 'Review', icon: ClipboardCheck },
  ]

  const currentIndex = steps.findIndex(s => s.id === currentStep)

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }))
  }

  const goToNextStep = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const goToPrevStep = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const handlePlaceOrder = async () => {
    if (!checkoutData.shippingAddress || !checkoutData.paymentMethod) {
      return
    }

    setIsSubmitting(true)

    try {
      const shippingFee = await calculateShipping(checkoutData.shippingAddress.city)
      
      const orderData: CheckoutData = {
        email: checkoutData.email!,
        phone: checkoutData.phone!,
        shippingAddress: checkoutData.shippingAddress,
        items: checkoutData.items!,
        subtotal: checkoutData.subtotal!,
        shippingFee,
        stitchingFee: checkoutData.stitchingFee!,
        discountCode: checkoutData.discountCode,
        discountAmount: checkoutData.discountAmount!,
        total: checkoutData.subtotal! + shippingFee + checkoutData.stitchingFee! - checkoutData.discountAmount!,
        paymentMethod: checkoutData.paymentMethod,
      }

      const result = await createNewOrder(orderData)

      if (result.success && result.orderNumber) {
        clearCart()
        setOrderResult({ orderNumber: result.orderNumber })
      } else {
        throw new Error(result.error || 'Order failed')
      }
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Order success screen
  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <h1 className="text-3xl font-display font-bold text-neutral-800 mb-4">
          Order Confirmed!
        </h1>
        
        <p className="text-neutral-600 mb-2">
          Thank you for your order. Your order number is:
        </p>
        
        <p className="text-2xl font-bold text-primary-gold mb-8">
          {orderResult.orderNumber}
        </p>
        
        <p className="text-neutral-500 mb-8">
          We&apos;ve sent a confirmation to your email and WhatsApp.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`/track/${orderResult.orderNumber}`}
            className="px-6 py-3 bg-primary-gold text-white rounded-xl font-semibold hover:bg-primary-gold-dark transition-colors"
          >
            Track Order
          </a>
          <a
            href="/shop"
            className="px-6 py-3 border border-neutral-300 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = step.id === currentStep
            // Icon is used in the JSX via step.icon

            return (
              <li key={step.id} className="flex items-center">
                <button
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  disabled={!isCompleted}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                    isCurrent && 'bg-primary-gold text-white',
                    isCompleted && 'bg-primary-gold/20 text-primary-gold cursor-pointer hover:bg-primary-gold/30',
                    !isCurrent && !isCompleted && 'text-neutral-400'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    isCurrent && 'bg-white/20',
                    isCompleted && 'bg-primary-gold text-white'
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </span>
                  <span className="hidden sm:block font-medium">{step.title}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <ChevronRight className={cn(
                    'w-5 h-5 mx-2',
                    index < currentIndex ? 'text-primary-gold' : 'text-neutral-300'
                  )} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 'shipping' && (
              <ShippingStep
                data={checkoutData}
                onUpdate={updateCheckoutData}
                onNext={goToNextStep}
              />
            )}
            
            {currentStep === 'stitching' && (
              <StitchingStep
                items={items.filter(i => i.customization?.isStitched)}
                data={checkoutData}
                onUpdate={updateCheckoutData}
                onNext={goToNextStep}
                onBack={goToPrevStep}
              />
            )}
            
            {currentStep === 'payment' && (
              <PaymentStep
                data={checkoutData}
                onUpdate={updateCheckoutData}
                onNext={goToNextStep}
                onBack={goToPrevStep}
              />
            )}
            
            {currentStep === 'review' && (
              <ReviewStep
                data={checkoutData}
                items={items}
                onPlaceOrder={handlePlaceOrder}
                onBack={goToPrevStep}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CheckoutWizard
