/**
 * Checkout Validation Schemas
 * Zod schemas for checkout form validation
 * 
 * @module lib/validations/checkout-schemas
 */

import { z } from 'zod';

/**
 * Customer Info Schema
 */
export const customerInfoSchema = z.object({
  fullName: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const cleaned = val.replace(/[\s-]/g, '');
      return /^(03\d{9}|92\d{10}|\+92\d{10})$/.test(cleaned);
    }, 'Invalid Pakistani phone number (e.g., 0302-0718182 or +923020718182)'),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .refine((val) => {
      const cleaned = val.replace(/[\s-]/g, '');
      return /^(03\d{9}|92\d{10}|\+92\d{10})$/.test(cleaned);
    }, 'Invalid WhatsApp number'),
});

/**
 * Shipping Address Schema
 */
export const shippingAddressSchema = z.object({
  fullAddress: z.string()
    .min(10, 'Please provide complete address with house/street details')
    .max(300, 'Address cannot exceed 300 characters'),
  city: z.string()
    .min(1, 'Please select a city'),
  province: z.string()
    .min(1, 'Please select a province'),
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Postal code must be 5 digits')
    .optional()
    .or(z.literal('')),
  deliveryInstructions: z.string()
    .max(500, 'Delivery instructions cannot exceed 500 characters')
    .optional(),
  saveAddress: z.boolean().optional(),
  addressId: z.string().optional(),
});

/**
 * Payment Details Schema
 */
export const paymentDetailsSchema = z.object({
  method: z.enum(['bank-transfer', 'jazzcash', 'easypaisa', 'cod'], {
    required_error: 'Please select a payment method',
  }),
  receiptImage: z.string().optional(),
  receiptFile: z.instanceof(File).optional(),
  transactionId: z.string()
    .min(1, 'Transaction ID is required')
    .optional()
    .or(z.literal('')),
  transactionDate: z.string()
    .optional(),
  advanceAmount: z.number()
    .min(0, 'Advance amount cannot be negative')
    .optional(),
  remainingAmount: z.number()
    .min(0, 'Remaining amount cannot be negative')
    .optional(),
}).superRefine((data, ctx) => {
  // For bank transfer, jazzcash, easypaisa - require receipt and transaction ID
  if (['bank-transfer', 'jazzcash', 'easypaisa'].includes(data.method)) {
    if (!data.receiptImage && !data.receiptFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Payment receipt is required',
        path: ['receiptImage'],
      });
    }
    if (!data.transactionId || data.transactionId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transaction ID is required',
        path: ['transactionId'],
      });
    }
  }

  // For COD - require 50% advance payment
  if (data.method === 'cod') {
    if (!data.advanceAmount || data.advanceAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Advance payment amount is required for COD',
        path: ['advanceAmount'],
      });
    }
    if (!data.receiptImage && !data.receiptFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Advance payment receipt is required for COD',
        path: ['receiptImage'],
      });
    }
  }
});

/**
 * Complete Checkout Form Schema
 */
export const checkoutFormSchema = z.object({
  customerInfo: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  payment: paymentDetailsSchema,
  promoCode: z.string().optional(),
  specialInstructions: z.string()
    .max(1000, 'Special instructions cannot exceed 1000 characters')
    .optional(),
  enableWhatsAppNotifications: z.boolean().default(true),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type CustomerInfoInput = z.infer<typeof customerInfoSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type PaymentDetailsInput = z.infer<typeof paymentDetailsSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

