// ==========================================
// BACKEND APPLICATION CONSTANTS
// ==========================================
// Centralized constants for the backend application
// including status codes, roles, order states, etc.
// ==========================================

// ==========================================
// USER ROLES & PERMISSIONS
// ==========================================

const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

const PERMISSIONS = {
  // Product permissions
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_PRODUCTS: 'view_products',

  // Order permissions
  VIEW_ALL_ORDERS: 'view_all_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  VERIFY_PAYMENT: 'verify_payment',
  CANCEL_ORDER: 'cancel_order',

  // Customer permissions
  VIEW_CUSTOMERS: 'view_customers',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',

  // Content permissions
  MANAGE_BLOG: 'manage_blog',
  MANAGE_SETTINGS: 'manage_settings',

  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_REPORTS: 'export_reports',
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.CUSTOMER]: [],
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
};

// ==========================================
// ORDER STATUS
// ==========================================

const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending-payment',
  PAYMENT_VERIFIED: 'payment-verified',
  MATERIAL_ARRANGED: 'material-arranged',
  IN_PROGRESS: 'in-progress',
  QUALITY_CHECK: 'quality-check',
  READY_DISPATCH: 'ready-dispatch',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'Pending Payment',
  [ORDER_STATUS.PAYMENT_VERIFIED]: 'Payment Verified',
  [ORDER_STATUS.MATERIAL_ARRANGED]: 'Material Arranged',
  [ORDER_STATUS.IN_PROGRESS]: 'Stitching in Progress',
  [ORDER_STATUS.QUALITY_CHECK]: 'Quality Check',
  [ORDER_STATUS.READY_DISPATCH]: 'Ready for Dispatch',
  [ORDER_STATUS.DISPATCHED]: 'Dispatched',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
};

// Status workflow (allowed transitions)
const ORDER_STATUS_WORKFLOW = {
  [ORDER_STATUS.PENDING_PAYMENT]: [ORDER_STATUS.PAYMENT_VERIFIED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_VERIFIED]: [ORDER_STATUS.MATERIAL_ARRANGED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.MATERIAL_ARRANGED]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.QUALITY_CHECK],
  [ORDER_STATUS.QUALITY_CHECK]: [ORDER_STATUS.READY_DISPATCH, ORDER_STATUS.IN_PROGRESS],
  [ORDER_STATUS.READY_DISPATCH]: [ORDER_STATUS.DISPATCHED],
  [ORDER_STATUS.DISPATCHED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.REFUNDED]: [],
};

// ==========================================
// PAYMENT STATUS & METHODS
// ==========================================

const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank-transfer',
  JAZZCASH: 'jazzcash',
  EASYPAISA: 'easypaisa',
  CASH_ON_DELIVERY: 'cod',
};

const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.JAZZCASH]: 'JazzCash',
  [PAYMENT_METHODS.EASYPAISA]: 'EasyPaisa',
  [PAYMENT_METHODS.CASH_ON_DELIVERY]: 'Cash on Delivery',
};

// ==========================================
// PRODUCT CATEGORIES
// ==========================================

const PRODUCT_CATEGORIES = {
  BRIDAL: 'bridal',
  PARTY_WEAR: 'party-wear',
  CASUAL: 'casual',
  FORMAL: 'formal',
  DESIGNER_REPLICA: 'designer-replica',
  LAWN: 'lawn',
  WINTER: 'winter',
  SUMMER: 'summer',
};

const CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.BRIDAL]: 'Bridal Wear',
  [PRODUCT_CATEGORIES.PARTY_WEAR]: 'Party Wear',
  [PRODUCT_CATEGORIES.CASUAL]: 'Casual Wear',
  [PRODUCT_CATEGORIES.FORMAL]: 'Formal Wear',
  [PRODUCT_CATEGORIES.DESIGNER_REPLICA]: 'Designer Replica',
  [PRODUCT_CATEGORIES.LAWN]: 'Lawn Collection',
  [PRODUCT_CATEGORIES.WINTER]: 'Winter Collection',
  [PRODUCT_CATEGORIES.SUMMER]: 'Summer Collection',
};

// ==========================================
// FABRIC TYPES
// ==========================================

const FABRIC_TYPES = {
  LAWN: 'lawn',
  CHIFFON: 'chiffon',
  SILK: 'silk',
  COTTON: 'cotton',
  VELVET: 'velvet',
  GEORGETTE: 'georgette',
  ORGANZA: 'organza',
  LINEN: 'linen',
  KARANDI: 'karandi',
  KHADDAR: 'khaddar',
};

const FABRIC_LABELS = {
  [FABRIC_TYPES.LAWN]: 'Lawn',
  [FABRIC_TYPES.CHIFFON]: 'Chiffon',
  [FABRIC_TYPES.SILK]: 'Silk',
  [FABRIC_TYPES.COTTON]: 'Cotton',
  [FABRIC_TYPES.VELVET]: 'Velvet',
  [FABRIC_TYPES.GEORGETTE]: 'Georgette',
  [FABRIC_TYPES.ORGANZA]: 'Organza',
  [FABRIC_TYPES.LINEN]: 'Linen',
  [FABRIC_TYPES.KARANDI]: 'Karandi',
  [FABRIC_TYPES.KHADDAR]: 'Khaddar',
};

// ==========================================
// SIZE CHART
// ==========================================

const SIZE_CHART = {
  XS: {
    label: 'Extra Small',
    bust: 32,
    waist: 26,
    hip: 34,
  },
  S: {
    label: 'Small',
    bust: 34,
    waist: 28,
    hip: 36,
  },
  M: {
    label: 'Medium',
    bust: 36,
    waist: 30,
    hip: 38,
  },
  L: {
    label: 'Large',
    bust: 38,
    waist: 32,
    hip: 40,
  },
  XL: {
    label: 'Extra Large',
    bust: 40,
    waist: 34,
    hip: 42,
  },
  XXL: {
    label: 'Double Extra Large',
    bust: 42,
    waist: 36,
    hip: 44,
  },
};

// ==========================================
// MEASUREMENT UNITS
// ==========================================

const MEASUREMENT_UNITS = {
  INCHES: 'inches',
  CM: 'cm',
};

// ==========================================
// SHIPPING & DELIVERY
// ==========================================

const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SAME_DAY: 'same-day',
  PICKUP: 'pickup',
};

const DELIVERY_AREAS = {
  LAHORE: {
    name: 'Lahore',
    fee: parseInt(process.env.SHIPPING_FEE_LAHORE) || 200,
    days: '2-3',
  },
  PAKISTAN: {
    name: 'Other Cities in Pakistan',
    fee: parseInt(process.env.SHIPPING_FEE_PAKISTAN) || 350,
    days: '4-7',
  },
  INTERNATIONAL: {
    name: 'International',
    fee: parseInt(process.env.SHIPPING_FEE_INTERNATIONAL) || 2500,
    days: '10-15',
  },
};

// ==========================================
// ORDER TYPES
// ==========================================

const ORDER_TYPES = {
  READY_MADE: 'ready-made',
  CUSTOM_STITCHING: 'custom-stitching',
  BRAND_REPLICA: 'brand-replica',
};

// ==========================================
// FILE UPLOAD
// ==========================================

const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
  PDF: ['application/pdf'],
  ALL_ALLOWED: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
const MAX_FILES_COUNT = parseInt(process.env.MAX_FILES_COUNT) || 10;

// ==========================================
// PAGINATION
// ==========================================

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: parseInt(process.env.DEFAULT_PAGE_SIZE) || 12,
  MAX_LIMIT: parseInt(process.env.MAX_PAGE_SIZE) || 100,
};

// ==========================================
// RATE LIMITING
// ==========================================

const RATE_LIMITS = {
  // API endpoints
  API_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Authentication
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_ATTEMPTS: 5,

  // File uploads
  UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  UPLOAD_MAX_REQUESTS: 10,
};

// ==========================================
// JWT EXPIRY
// ==========================================

const JWT_EXPIRY = {
  ACCESS_TOKEN: process.env.JWT_EXPIRE || '24h',
  REFRESH_TOKEN: process.env.JWT_REFRESH_EXPIRE || '7d',
  PASSWORD_RESET: '1h',
  EMAIL_VERIFICATION: '24h',
};

// ==========================================
// HTTP STATUS CODES
// ==========================================

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ==========================================
// ERROR CODES
// ==========================================

const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',

  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

// ==========================================
// NOTIFICATION TYPES
// ==========================================

const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order-created',
  PAYMENT_VERIFIED: 'payment-verified',
  ORDER_STATUS_UPDATE: 'order-status-update',
  ORDER_DELIVERED: 'order-delivered',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
};

// ==========================================
// BLOG CATEGORIES
// ==========================================

const BLOG_CATEGORIES = {
  STITCHING_TIPS: 'stitching-tips',
  FABRIC_GUIDE: 'fabric-guide',
  STYLING_IDEAS: 'styling-ideas',
  BRIDAL_TRENDS: 'bridal-trends',
  SEASONAL: 'seasonal',
  BEHIND_THE_SCENES: 'behind-the-scenes',
};

// ==========================================
// REVIEW STATUS
// ==========================================

const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ==========================================
// BUSINESS CONSTANTS
// ==========================================

const BUSINESS = {
  NAME: process.env.BUSINESS_NAME || 'Laraib Creative',
  EMAIL: process.env.BUSINESS_EMAIL || 'kaash0297@gmail.com',
  PHONE: process.env.BUSINESS_PHONE || '03020718182',
  WHATSAPP: process.env.BUSINESS_WHATSAPP || '923020718182',
  ADDRESS: process.env.BUSINESS_ADDRESS || 'Bhubtian, Lahore, Pakistan',
  CURRENCY: process.env.CURRENCY || 'PKR',
  CURRENCY_SYMBOL: process.env.CURRENCY_SYMBOL || 'Rs.',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Karachi',
};

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: 'Order Confirmation',
  PAYMENT_VERIFIED: 'Payment Verified',
  ORDER_STATUS_UPDATE: 'Order Status Update',
  ORDER_DELIVERED: 'Order Delivered',
  PASSWORD_RESET: 'Password Reset Request',
  WELCOME: `Welcome to ${BUSINESS.NAME}`,
};

// ==========================================
// REGEX PATTERNS
// ==========================================

const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PAKISTANI_PHONE: /^(92)?3[0-9]{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  // User & Permissions
  USER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,

  // Orders
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_WORKFLOW,
  ORDER_TYPES,

  // Payments
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,

  // Products
  PRODUCT_CATEGORIES,
  CATEGORY_LABELS,
  FABRIC_TYPES,
  FABRIC_LABELS,
  SIZE_CHART,
  MEASUREMENT_UNITS,

  // Shipping
  SHIPPING_METHODS,
  DELIVERY_AREAS,

  // Files
  FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,

  // Pagination
  PAGINATION,

  // Rate Limiting
  RATE_LIMITS,

  // JWT
  JWT_EXPIRY,

  // HTTP & Errors
  HTTP_STATUS,
  ERROR_CODES,

  // Notifications
  NOTIFICATION_TYPES,

  // Blog
  BLOG_CATEGORIES,

  // Reviews
  REVIEW_STATUS,

  // Business
  BUSINESS,
  EMAIL_SUBJECTS,

  // Validation
  REGEX_PATTERNS,
};