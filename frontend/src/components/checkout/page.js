'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Main Checkout Page Component
 * Handles multi-step checkout process with form data persistence
 * 
 * Flow:
 * 1. Customer Information
 * 2. Shipping Address
 * 3. Payment Method & Receipt Upload
 * 4. Order Review & Confirmation
 * 5. Success Page
 * 
 * Features:
 * - Step-by-step navigation
 * - Form data persistence in state
 * - Validation at each step
 * - Mobile responsive
 * - Loading states
 * - Error handling
 */

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Cart items and pricing (in real app, fetch from cart context/API)
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });

  // Form data storage
  const [formData, setFormData] = useState({
    customerInfo: {
      fullName: '',
      email: '',
      phone: '',
      whatsapp: ''
    },
    shippingAddress: {
      fullAddress: '',
      city: '',
      province: '',
      postalCode: '',
      deliveryInstructions: '',
      saveAddress: false
    },
    payment: {
      method: 'bank-transfer', // 'bank-transfer' or 'cod'
      receiptImage: null,
      receiptPreview: null,
      transactionId: '',
      transactionDate: ''
    },
    termsAccepted: false
  });

  // Step configuration
  const steps = [
    { number: 1, title: 'Customer Info', component: CustomerInfoForm },
    { number: 2, title: 'Shipping Address', component: ShippingAddressForm },
    { number: 3, title: 'Payment Method', component: PaymentMethod },
    { number: 4, title: 'Review Order', component: OrderReview }
  ];

  /**
   * Load cart data and user info on mount
   */
  useEffect(() => {
    loadCheckoutData();
  }, []);

  /**
   * Load cart items and pre-fill user data if logged in
   */
  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);

      // Check if cart has items
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        router.push('/cart');
        return;
      }

      // Calculate pricing
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 5000 ? 0 : 200; // Free shipping over 5000 PKR
      const discount = 0; // Apply discount logic here
      const total = subtotal + shipping - discount;

      setCartData({
        items: cart,
        subtotal,
        shipping,
        discount,
        total
      });

      // Pre-fill user data if logged in
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user) {
        setFormData(prev => ({
          ...prev,
          customerInfo: {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            whatsapp: user.whatsapp || user.phone || ''
          }
        }));

        // Load saved addresses
        if (user.addresses && user.addresses.length > 0) {
          const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              fullAddress: defaultAddress.fullAddress || '',
              city: defaultAddress.city || '',
              province: defaultAddress.province || '',
              postalCode: defaultAddress.postalCode || '',
              deliveryInstructions: '',
              saveAddress: false
            }
          }));
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      setIsLoading(false);
    }
  };

  /**
   * Update form data for specific step
   */
  const updateFormData = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  /**
   * Navigate to next step
   */
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Submit order to backend
   */
  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      // Prepare order data
      const orderPayload = new FormData();
      
      // Add customer info
      orderPayload.append('customerInfo', JSON.stringify(formData.customerInfo));
      
      // Add shipping address
      orderPayload.append('shippingAddress', JSON.stringify(formData.shippingAddress));
      
      // Add items
      orderPayload.append('items', JSON.stringify(cartData.items));
      
      // Add pricing
      orderPayload.append('pricing', JSON.stringify({
        subtotal: cartData.subtotal,
        shipping: cartData.shipping,
        discount: cartData.discount,
        total: cartData.total
      }));
      
      // Add payment info
      orderPayload.append('paymentMethod', formData.payment.method);
      
      if (formData.payment.method === 'bank-transfer') {
        if (formData.payment.receiptImage) {
          orderPayload.append('receipt', formData.payment.receiptImage);
        }
        orderPayload.append('transactionId', formData.payment.transactionId);
        orderPayload.append('transactionDate', formData.payment.transactionDate);
      }

      // Make API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: orderPayload,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();

      // Set order data for confirmation page
      setOrderData(result.order);

      // Clear cart
      localStorage.removeItem('cart');

      // Move to confirmation step
      setCurrentStep(5);

      // Send WhatsApp notification (in real app, backend handles this)
      console.log('Order placed successfully:', result.order);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  /**
   * Render confirmation page
   */
  if (currentStep === 5 && orderData) {
    return <OrderConfirmation order={orderData} />;
  }

  /**
   * Get current step component
   */
  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order in a few simple steps</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper currentStep={currentStep} steps={steps} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {CurrentStepComponent && (
                <CurrentStepComponent
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNextStep}
                  onBack={handlePreviousStep}
                  onSubmit={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                  cartData={cartData}
                />
              )}
            </div>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {cartData.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.isCustom && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">PKR {cartData.subtotal.toLocaleString()}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cartData.shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `PKR ${cartData.shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                {/* Discount */}
                {cartData.discount > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -PKR {cartData.discount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span className="text-purple-600">PKR {cartData.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {cartData.shipping > 0 && cartData.subtotal < 5000 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Add PKR {(5000 - cartData.subtotal).toLocaleString()} more to get free shipping!
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}