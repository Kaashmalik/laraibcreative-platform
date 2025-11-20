/**
 * Checkout Types
 * TypeScript interfaces for checkout process
 * 
 * @module types/checkout
 */

export type PaymentMethod = 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod';

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface ShippingAddress {
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  saveAddress?: boolean;
  addressId?: string; // For saved addresses
}

export interface PaymentDetails {
  method: PaymentMethod;
  receiptImage?: string; // Cloudinary URL
  receiptFile?: File; // For upload
  transactionId?: string;
  transactionDate?: string;
  advanceAmount?: number; // For COD
  remainingAmount?: number; // For COD
}

export interface CheckoutFormData {
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  promoCode?: string;
  specialInstructions?: string;
  termsAccepted: boolean;
}

export interface SavedAddress {
  _id: string;
  label?: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

export interface OrderSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      orderNumber: string;
      status: string;
      total: number;
      createdAt: string;
    };
    trackingUrl: string;
  };
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: string;
  description: string;
  instructions?: string[];
  note?: string;
}

