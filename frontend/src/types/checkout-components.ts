/**
 * Checkout Components Type Definitions
 * TypeScript interfaces for all checkout-related components
 * 
 * @module types/checkout-components
 */

import type { CheckoutFormData, CustomerInfo } from './checkout';

/**
 * Customer Info Form Props
 */
export interface CustomerInfoFormProps {
  data?: Partial<CustomerInfo>;
  onUpdate: (data: CustomerInfo) => void;
  onNext: () => void;
  errors?: Record<string, string>;
}

/**
 * Shipping Address Form Props
 */
export interface ShippingAddressFormProps {
  formData: Partial<CheckoutFormData>;
  updateFormData: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Record<string, string>;
}

/**
 * Payment Method Component Props
 */
export interface PaymentMethodProps {
  formData: Partial<CheckoutFormData>;
  updateFormData: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Record<string, string>;
  total: number;
}

/**
 * Order Review Component Props
 */
export interface OrderReviewProps {
  formData: CheckoutFormData;
  updateFormData: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  cartData: CartDataDisplay;
  errors?: Record<string, string>;
}

/**
 * Cart Item Display Type
 */
export interface CartItemDisplay {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  isCustom?: boolean;
}

/**
 * Cart Data Display Type
 */
export interface CartDataDisplay {
  items: CartItemDisplay[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Checkout Stepper Props
 */
export interface CheckoutStepperProps {
  currentStep: number;
  steps: Array<{
    number: number;
    title: string;
  }>;
}

/**
 * Order Summary Props
 */
export interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  promoCode?: string;
  onPromoCodeChange: (code: string) => void;
}

/**
 * Trust Badges Props
 */
export interface TrustBadgesProps {
  className?: string;
}

/**
 * Order Confirmation Data
 */
export interface OrderConfirmationData {
  orderNumber: string;
  total: number;
  itemCount: number;
  paymentMethod: 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp?: string;
  shippingAddress: string;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
}

/**
 * Order Confirmation Props
 */
export interface OrderConfirmationProps {
  order: OrderConfirmationData;
}

/**
 * Payment Method Option
 */
export interface PaymentMethodOption {
  value: 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod';
  label: string;
  icon: string;
  description: string;
  instructions?: string[];
  note?: string;
  accountDetails?: {
    bankName?: string;
    accountNumber: string;
    accountName: string;
    accountType?: string;
    iban?: string;
  };
}

/**
 * Form Field Error
 */
export interface FormFieldError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

/**
 * Checkout State
 */
export interface CheckoutState {
  currentStep: number;
  formData: Partial<CheckoutFormData>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submittedOrder: any | null;
}

/**
 * Checkout Actions
 */
export interface CheckoutActions {
  updateFormData: (field: string, value: any) => void;
  validateStep: (step: number) => boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmitOrder: () => Promise<void>;
  clearErrors: () => void;
  setError: (field: string, message: string) => void;
}
