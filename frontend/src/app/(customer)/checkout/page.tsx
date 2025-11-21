/**
 * Checkout Page
 * Complete multi-step checkout process
 * 
 * @module app/(customer)/checkout/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmation, { type OrderConfirmationData } from '@/components/checkout/OrderConfirmation';
import OrderSummary from '@/components/checkout/OrderSummary';
import TrustBadges from '@/components/checkout/TrustBadges';
import { checkoutFormSchema, type CheckoutFormInput, type CustomerInfoInput } from '@/lib/validations/checkout-schemas';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { OrderSubmissionResponse } from '@/types/checkout';

const CHECKOUT_STEPS: Array<{ number: number; title: string }> = [
  { number: 1, title: 'Customer Info' },
  { number: 2, title: 'Shipping' },
  { number: 3, title: 'Payment' },
  { number: 4, title: 'Review' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, shipping, discount, total, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CheckoutFormInput>>({
    customerInfo: {
      fullName: '',
      email: '',
      phone: '',
      whatsapp: '',
    },
    enableWhatsAppNotifications: true, // WhatsApp toggle for order updates
    shippingAddress: {
      fullAddress: '',
      city: '',
      province: '',
      postalCode: '',
      deliveryInstructions: '',
      saveAddress: false,
    },
    payment: {
      method: 'bank-transfer',
    },
    termsAccepted: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderSubmissionResponse['data'] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !submittedOrder) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [items.length, router, submittedOrder]);

  /**
   * Update form data
   */
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    try {
      switch (step) {
        case 1:
          const customerInfoResult = checkoutFormSchema.shape.customerInfo.safeParse(formData.customerInfo);
          if (!customerInfoResult.success) {
            const customerErrors: Record<string, string> = {};
            customerInfoResult.error.errors.forEach(err => {
              customerErrors[`customerInfo.${err.path[0]}`] = err.message;
            });
            setErrors(customerErrors);
            return false;
          }
          break;

        case 2:
          const shippingResult = checkoutFormSchema.shape.shippingAddress.safeParse(formData.shippingAddress);
          if (!shippingResult.success) {
            const shippingErrors: Record<string, string> = {};
            shippingResult.error.errors.forEach(err => {
              shippingErrors[`shippingAddress.${err.path[0]}`] = err.message;
            });
            setErrors(shippingErrors);
            return false;
          }
          break;

        case 3:
          const paymentResult = checkoutFormSchema.shape.payment.safeParse(formData.payment);
          if (!paymentResult.success) {
            const paymentErrors: Record<string, string> = {};
            paymentResult.error.errors.forEach(err => {
              paymentErrors[`payment.${err.path[0]}`] = err.message;
            });
            setErrors(paymentErrors);
            return false;
          }
          break;

        case 4:
          const fullResult = checkoutFormSchema.safeParse(formData);
          if (!fullResult.success) {
            const fullErrors: Record<string, string> = {};
            fullResult.error.errors.forEach(err => {
              const path = err.path.join('.');
              fullErrors[path] = err.message;
            });
            setErrors(fullErrors);
            return false;
          }
          break;
      }
      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < CHECKOUT_STEPS.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please correct the errors before continuing');
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Navigate to specific step
   */
  const goToStep = (step: number) => {
    if (step >= 1 && step <= CHECKOUT_STEPS.length && step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Submit order
   */
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Final validation
      const validationResult = checkoutFormSchema.safeParse(formData);
      if (!validationResult.success) {
        const validationErrors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          const path = err.path.join('.');
          validationErrors[path] = err.message;
        });
        setErrors(validationErrors);
        toast.error('Please correct the errors before submitting');
        setIsSubmitting(false);
        return;
      }

      const validatedData = validationResult.data;

      // Prepare order items from cart
      const orderItems = items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        isCustom: item.isCustom || false,
        customizations: item.customizations,
        price: item.priceAtAdd || item.product.pricing?.basePrice || item.product.price || 0,
      }));

      // Prepare shipping address for backend
      const shippingAddress = {
        fullName: validatedData.customerInfo.fullName,
        phone: validatedData.customerInfo.phone,
        whatsapp: validatedData.customerInfo.whatsapp,
        addressLine1: validatedData.shippingAddress.fullAddress,
        city: validatedData.shippingAddress.city,
        province: validatedData.shippingAddress.province,
        postalCode: validatedData.shippingAddress.postalCode || '',
        deliveryInstructions: validatedData.shippingAddress.deliveryInstructions || '',
      };

      // Prepare payment data
      const paymentData: any = {
        method: validatedData.payment.method,
        status: 'pending',
      };

      // Add payment-specific fields
      if (validatedData.payment.receiptImage) {
        // Ensure receipt image is properly formatted
        paymentData.receiptImage = typeof validatedData.payment.receiptImage === 'string'
          ? validatedData.payment.receiptImage
          : validatedData.payment.receiptImage;
      }
      if (validatedData.payment.transactionId) {
        paymentData.transactionId = validatedData.payment.transactionId;
      }
      if (validatedData.payment.transactionDate) {
        paymentData.transactionDate = validatedData.payment.transactionDate;
      }
      if (validatedData.payment.method === 'cod') {
        paymentData.advanceAmount = validatedData.payment.advanceAmount || 0;
        paymentData.remainingAmount = total - (validatedData.payment.advanceAmount || 0);
      }
      
      // Add WhatsApp notification preference
      if (formData.enableWhatsAppNotifications !== undefined) {
        paymentData.enableWhatsAppNotifications = formData.enableWhatsAppNotifications;
      }

      // Prepare order payload
      const orderPayload = {
        items: orderItems,
        shippingAddress,
        payment: paymentData,
        customerInfo: validatedData.customerInfo,
        specialInstructions: validatedData.specialInstructions || '',
      };

      // Submit order
      const response = await api.orders.create(orderPayload);
      const result: OrderSubmissionResponse = response as unknown as OrderSubmissionResponse;

      if (result.success) {
        // Clear cart
        await clearCart();
        
        // Set submitted order
        setSubmittedOrder(result.data);
        
        // Show success message
        toast.success('Order placed successfully!');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmation page if order is submitted
  if (submittedOrder) {
    const confirmationData: OrderConfirmationData = {
      orderNumber: submittedOrder.order.orderNumber,
      total: submittedOrder.order.total || total,
      itemCount: items.length,
      paymentMethod: (formData.payment?.method as 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod') || 'bank-transfer',
      customerName: formData.customerInfo?.fullName || '',
      customerEmail: formData.customerInfo?.email || '',
      customerPhone: formData.customerInfo?.phone || '',
      customerWhatsApp: formData.customerInfo?.whatsapp,
      shippingAddress: `${formData.shippingAddress?.fullAddress}, ${formData.shippingAddress?.city}, ${formData.shippingAddress?.province}`,
      subtotal: subtotal,
      shipping: shipping,
      discount: discount,
      tax: tax,
    };
    
    return <OrderConfirmation order={confirmationData} />;
  }

  // Show empty cart message
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order in a few simple steps</p>
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper currentStep={currentStep} steps={CHECKOUT_STEPS} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <CustomerInfoForm
                    data={formData.customerInfo}
                    onUpdate={(data: CustomerInfoInput) => {
                      updateFormData('customerInfo', data);
                    }}
                    onNext={handleNext}
                    errors={errors}
                  />
                  
                  {/* WhatsApp Notifications Toggle */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableWhatsAppNotifications ?? true}
                        onChange={(e) => updateFormData('enableWhatsAppNotifications', e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <span className="font-semibold text-gray-900">
                            Enable WhatsApp Notifications
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive order updates and tracking information via WhatsApp
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <ShippingAddressForm
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  errors={errors}
                />
              )}

              {currentStep === 3 && (
                <PaymentMethod
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  errors={errors}
                  total={total}
                />
              )}

              {currentStep === 4 && (
                <OrderReview
                  formData={formData as CheckoutFormInput}
                  updateFormData={updateFormData}
                  onBack={handleBack}
                  onSubmit={handleSubmitOrder}
                  isSubmitting={isSubmitting}
                  cartData={{
                    items: items.map(item => ({
                      id: item.id,
                      title: item.product.name || 'Product',
                      image: item.product.image || '',
                      price: item.priceAtAdd || item.product.pricing?.basePrice || item.product.price || 0,
                      quantity: item.quantity,
                      isCustom: item.isCustom || false,
                    })),
                    subtotal,
                    shipping,
                    discount,
                    tax,
                    total,
                  }}
                  errors={errors}
                />
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                discount={discount}
                tax={tax}
                total={total}
                promoCode={formData.promoCode}
                onPromoCodeChange={(code) => updateFormData('promoCode', code)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

