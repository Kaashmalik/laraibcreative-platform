/**
 * Form validation schemas using Yup
 * Production-ready with comprehensive validation rules
 */
import * as yup from 'yup';
import { ALL_CITIES, MEASUREMENT_FIELDS } from './constants';

/**
 * Phone number regex for Pakistani numbers
 * Supports: 03001234567, 923001234567, +923001234567
 * Also supports formatted versions: 0300-1234567, +92 300 1234567
 */
const PHONE_REGEX = /^(\+92|92|0)?[\s-]?(3\d{2}|2\d{2}|4\d{2}|5\d{2}|6\d{2}|7\d{2}|8\d{2}|9\d{2})[\s-]?\d{7}$/;

/**
 * Login form validation schema
 */
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: yup
    .boolean()
    .optional()
});

/**
 * Registration form validation schema
 */
export const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(PHONE_REGEX, 'Please enter a valid Pakistani phone number (e.g., 0300-1234567)'),
  whatsapp: yup
    .string()
    .matches(PHONE_REGEX, 'Please enter a valid Pakistani phone number')
    .optional()
    .nullable(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be less than 50 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

/**
 * Address form validation schema
 */
export const addressSchema = yup.object().shape({
  fullAddress: yup
    .string()
    .required('Complete address is required')
    .min(10, 'Please enter complete address with house number and street name')
    .max(200, 'Address must be less than 200 characters')
    .trim(),
  city: yup
    .string()
    .required('City is required')
    .oneOf(ALL_CITIES, 'Please select a valid city from the list'),
  province: yup
    .string()
    .required('Province is required')
    .oneOf(['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Federal'], 'Please select a valid province'),
  postalCode: yup
    .string()
    .required('Postal code is required')
    .matches(/^\d{5}$/, 'Postal code must be exactly 5 digits')
    .length(5, 'Postal code must be exactly 5 digits'),
  nearestLandmark: yup
    .string()
    .max(100, 'Landmark must be less than 100 characters')
    .optional()
    .nullable(),
  isDefault: yup
    .boolean()
    .optional()
});

/**
 * Create measurement validation for a field
 */
const createMeasurementValidation = (field) => {
  return yup
    .number()
    .required(`${field.label} is required`)
    .positive(`${field.label} must be a positive number`)
    .min(field.min, `${field.label} must be at least ${field.min} cm`)
    .max(field.max, `${field.label} cannot exceed ${field.max} cm`)
    .typeError(`${field.label} must be a valid number`);
};

/**
 * Measurement form validation schema
 */
export const measurementSchema = yup.object().shape(
  [...MEASUREMENT_FIELDS.upperBody, ...MEASUREMENT_FIELDS.lowerBody, ...MEASUREMENT_FIELDS.dupatta]
    .reduce((acc, field) => {
      acc[field.key] = createMeasurementValidation(field);
      return acc;
    }, {})
);

/**
 * Product form validation schema (admin)
 */
export const productSchema = yup.object().shape({
  title: yup
    .string()
    .required('Product title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: yup
    .string()
    .required('Product description is required')
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  category: yup
    .string()
    .required('Category is required'),
  subcategory: yup
    .string()
    .optional()
    .nullable(),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be positive')
    .min(100, 'Price must be at least Rs. 100')
    .max(1000000, 'Price cannot exceed Rs. 10,00,000')
    .typeError('Price must be a valid number'),
  comparePrice: yup
    .number()
    .positive('Compare price must be positive')
    .min(yup.ref('price'), 'Compare price must be greater than selling price')
    .optional()
    .nullable()
    .typeError('Compare price must be a valid number'),
  stock: yup
    .number()
    .required('Stock quantity is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .typeError('Stock must be a valid number'),
  sku: yup
    .string()
    .required('SKU is required')
    .matches(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens')
    .max(50, 'SKU must be less than 50 characters')
    .trim(),
  images: yup
    .array()
    .of(yup.string().url('Invalid image URL'))
    .min(1, 'At least one product image is required')
    .max(10, 'Maximum 10 images allowed')
    .required('Product images are required'),
  fabric: yup
    .string()
    .optional()
    .nullable(),
  occasion: yup
    .string()
    .optional()
    .nullable(),
  tags: yup
    .array()
    .of(yup.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  featured: yup
    .boolean()
    .optional(),
  published: yup
    .boolean()
    .optional(),
  seoTitle: yup
    .string()
    .max(60, 'SEO title should be less than 60 characters for optimal display')
    .optional()
    .nullable(),
  seoDescription: yup
    .string()
    .max(160, 'SEO description should be less than 160 characters for optimal display')
    .optional()
    .nullable()
});

/**
 * Order creation validation schema
 */
export const orderSchema = yup.object().shape({
  items: yup
    .array()
    .of(
      yup.object().shape({
        productId: yup.string().required('Product ID is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .positive('Quantity must be positive')
          .integer('Quantity must be a whole number')
          .max(50, 'Maximum 50 items per product')
          .typeError('Quantity must be a valid number')
      })
    )
    .min(1, 'Order must contain at least one item')
    .max(20, 'Maximum 20 different products per order')
    .required('Order items are required'),
  shippingAddress: addressSchema.required('Shipping address is required'),
  paymentMethod: yup
    .string()
    .required('Payment method is required')
    .oneOf(['bank-transfer', 'cod', 'jazzcash', 'easypaisa'], 'Invalid payment method'),
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .nullable(),
  couponCode: yup
    .string()
    .max(20, 'Invalid coupon code')
    .optional()
    .nullable()
});

/**
 * Contact form validation schema
 */
export const contactFormSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  phone: yup
    .string()
    .matches(PHONE_REGEX, 'Please enter a valid Pakistani phone number')
    .optional()
    .nullable(),
  subject: yup
    .string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .trim(),
  message: yup
    .string()
    .required('Message is required')
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .trim()
});

/**
 * Custom order form validation schema
 */
export const customOrderSchema = yup.object().shape({
  serviceType: yup
    .string()
    .required('Service type is required')
    .oneOf(['stitching', 'alteration', 'design'], 'Invalid service type'),
  fabric: yup
    .string()
    .required('Fabric type is required'),
  images: yup
    .array()
    .of(yup.string().url('Invalid image URL'))
    .min(1, 'Please upload at least one reference image')
    .max(5, 'Maximum 5 images allowed')
    .required('Reference images are required'),
  measurements: measurementSchema.required('Measurements are required'),
  urgentDelivery: yup
    .boolean()
    .optional(),
  specialInstructions: yup
    .string()
    .max(500, 'Instructions must be less than 500 characters')
    .optional()
    .nullable()
});

/**
 * Review form validation schema
 */
export const reviewSchema = yup.object().shape({
  rating: yup
    .number()
    .required('Rating is required')
    .integer('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .typeError('Rating must be a valid number'),
  title: yup
    .string()
    .required('Review title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  comment: yup
    .string()
    .required('Review comment is required')
    .min(20, 'Comment must be at least 20 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim(),
  images: yup
    .array()
    .of(yup.string().url('Invalid image URL'))
    .max(5, 'Maximum 5 images allowed')
    .optional()
});

/**
 * Password reset validation schema
 */
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

/**
 * Newsletter subscription validation schema
 */
export const newsletterSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim()
});

/**
 * Profile update validation schema
 */
export const profileSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(PHONE_REGEX, 'Please enter a valid Pakistani phone number'),
  whatsapp: yup
    .string()
    .matches(PHONE_REGEX, 'Please enter a valid Pakistani phone number')
    .optional()
    .nullable(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .optional()
    .nullable()
    .typeError('Invalid date'),
  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .optional()
    .nullable()
});

/**
 * Coupon code validation schema
 */
export const couponSchema = yup.object().shape({
  code: yup
    .string()
    .required('Coupon code is required')
    .min(4, 'Coupon code must be at least 4 characters')
    .max(20, 'Coupon code must be less than 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Coupon code can only contain uppercase letters, numbers, and hyphens')
    .trim()
});

/**
 * Bank account validation schema (for payment verification)
 */
export const bankAccountSchema = yup.object().shape({
  accountTitle: yup
    .string()
    .required('Account title is required')
    .min(3, 'Account title must be at least 3 characters')
    .max(100, 'Account title must be less than 100 characters')
    .trim(),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .matches(/^\d+$/, 'Account number must contain only digits')
    .min(10, 'Account number must be at least 10 digits')
    .max(24, 'Account number must be less than 24 digits'),
  bankName: yup
    .string()
    .required('Bank name is required')
    .min(3, 'Bank name must be at least 3 characters')
    .max(50, 'Bank name must be less than 50 characters')
    .trim(),
  iban: yup
    .string()
    .matches(/^PK\d{2}[A-Z]{4}\d{16}$/, 'Please enter a valid IBAN format (e.g., PK36ABCD0000001234567890)')
    .optional()
    .nullable()
});