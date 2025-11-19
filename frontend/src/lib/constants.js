/**
 * Application Constants
 * Production-ready centralized configuration for LaraibCreative platform
 * Updated with Ad Management, SEO, and CMS features
 */

// ============================================================================
// ENVIRONMENT & CONFIGURATION
// ============================================================================

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// API and Site URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = 'LaraibCreative';

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
export const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Image quality settings for different use cases
 */
export const IMAGE_QUALITY = {
  thumbnail: 50,    // Low quality for thumbnails
  low: 60,
  medium: 75,       // Medium quality for product listings
  high: 90,         // High quality for product details
  original: 100     // Original quality for zoom/downloads
};

/**
 * Image dimensions for responsive images
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  hero: { width: 1920, height: 800 },
  banner: { width: 1920, height: 600 }
};

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 12;
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const BLOG_POSTS_PER_PAGE = 9;
export const ADS_PER_PAGE = 12;

/**
 * Default pagination settings
 */
export const PAGINATION = {
  itemsPerPage: 12,
  itemsPerPageOptions: [12, 24, 36, 48],
  maxPages: 10
};

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

/**
 * Order status values and their properties
 */
export const ORDER_STATUSES = {
  'pending-payment': {
    label: 'Pending Payment',
    color: 'yellow',
    description: 'Waiting for payment confirmation',
    icon: 'Clock'
  },
  'payment-verified': {
    label: 'Payment Verified',
    color: 'blue',
    description: 'Payment received and verified',
    icon: 'CheckCircle'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'purple',
    description: 'Order is being stitched',
    icon: 'Package'
  },
  'quality-check': {
    label: 'Quality Check',
    color: 'indigo',
    description: 'Final quality inspection',
    icon: 'ClipboardCheck'
  },
  'ready-for-dispatch': {
    label: 'Ready for Dispatch',
    color: 'orange',
    description: 'Ready to be shipped',
    icon: 'PackageCheck'
  },
  'out-for-delivery': {
    label: 'Out for Delivery',
    color: 'cyan',
    description: 'With courier service',
    icon: 'Truck'
  },
  'delivered': {
    label: 'Delivered',
    color: 'green',
    description: 'Successfully delivered',
    icon: 'CheckCircle2'
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'red',
    description: 'Order cancelled',
    icon: 'XCircle'
  }
};

/**
 * Get status array in sequence
 */
export const ORDER_STATUS_SEQUENCE = [
  'pending-payment',
  'payment-verified',
  'in-progress',
  'quality-check',
  'ready-for-dispatch',
  'out-for-delivery',
  'delivered',
  'cancelled'
];

// Legacy order status (for backward compatibility)
export const ORDER_STATUS = {
  PENDING: 'pending-payment',
  CONFIRMED: 'payment-verified',
  PAYMENT_VERIFIED: 'payment-verified',
  IN_PROGRESS: 'in-progress',
  STITCHING: 'in-progress',
  QUALITY_CHECK: 'quality-check',
  READY: 'ready-for-dispatch',
  SHIPPED: 'out-for-delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'cancelled'
};

// ============================================================================
// AD MANAGEMENT (NEW)
// ============================================================================

/**
 * Ad status values
 */
export const AD_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
  FEATURED: 'featured'
};

export const AD_STATUS_LABELS = {
  [AD_STATUS.PENDING]: 'Pending Approval',
  [AD_STATUS.ACTIVE]: 'Active',
  [AD_STATUS.SOLD]: 'Sold',
  [AD_STATUS.EXPIRED]: 'Expired',
  [AD_STATUS.REJECTED]: 'Rejected',
  [AD_STATUS.FEATURED]: 'Featured'
};

export const AD_STATUS_COLORS = {
  [AD_STATUS.PENDING]: 'yellow',
  [AD_STATUS.ACTIVE]: 'green',
  [AD_STATUS.SOLD]: 'gray',
  [AD_STATUS.EXPIRED]: 'orange',
  [AD_STATUS.REJECTED]: 'red',
  [AD_STATUS.FEATURED]: 'purple'
};

/**
 * Ad categories
 */
export const AD_CATEGORIES = {
  CLOTHING: 'clothing',
  FABRIC: 'fabric',
  ACCESSORIES: 'accessories',
  SERVICES: 'services',
  CUSTOM_ORDERS: 'custom-orders',
  WHOLESALE: 'wholesale',
  OTHER: 'other'
};

export const AD_CATEGORY_LABELS = {
  [AD_CATEGORIES.CLOTHING]: 'Clothing & Apparel',
  [AD_CATEGORIES.FABRIC]: 'Fabrics & Materials',
  [AD_CATEGORIES.ACCESSORIES]: 'Accessories',
  [AD_CATEGORIES.SERVICES]: 'Stitching Services',
  [AD_CATEGORIES.CUSTOM_ORDERS]: 'Custom Orders',
  [AD_CATEGORIES.WHOLESALE]: 'Wholesale',
  [AD_CATEGORIES.OTHER]: 'Other'
};

/**
 * Ad duration options (in days)
 */
export const AD_DURATION = {
  DAYS_7: 7,
  DAYS_15: 15,
  DAYS_30: 30,
  DAYS_60: 60,
  DAYS_90: 90
};

export const AD_BOOST_PLANS = {
  BASIC: { days: 7, price: 500, label: 'Basic - 7 Days' },
  STANDARD: { days: 15, price: 900, label: 'Standard - 15 Days' },
  PREMIUM: { days: 30, price: 1500, label: 'Premium - 30 Days' }
};

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Available payment methods
 */
export const PAYMENT_METHODS = [
  {
    value: 'bank-transfer',
    label: 'Bank Transfer',
    description: 'Transfer to our bank account',
    icon: 'Building2',
    available: true
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: 'Banknote',
    available: true
  },
  {
    value: 'jazzcash',
    label: 'JazzCash',
    description: 'Mobile wallet payment',
    icon: 'Smartphone',
    available: true
  },
  {
    value: 'easypaisa',
    label: 'EasyPaisa',
    description: 'Mobile wallet payment',
    icon: 'Smartphone',
    available: true
  }
];

// Legacy payment methods object
export const PAYMENT_METHOD_TYPES = {
  BANK_TRANSFER: 'bank-transfer',
  EASYPAISA: 'easypaisa',
  JAZZCASH: 'jazzcash',
  COD: 'cod'
};

// ============================================================================
// USER ROLES & PERMISSIONS
// ============================================================================

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin'
};

export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_SEO: 'manage_seo',
  MANAGE_ADS: 'manage_ads',
  VIEW_ANALYTICS: 'view_analytics'
};

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

/**
 * Product categories
 */
export const PRODUCT_CATEGORIES = [
  { value: 'unstitched', label: 'Unstitched', description: 'Fabric ready for custom tailoring' },
  { value: 'ready-to-wear', label: 'Ready to Wear', description: 'Pre-stitched outfits' },
  { value: 'accessories', label: 'Accessories', description: 'Jewelry, bags, and more' },
  { value: 'footwear', label: 'Footwear', description: 'Shoes and sandals' }
];

/**
 * Types of fabrics available with properties
 */
export const FABRIC_TYPES = [
  { value: 'lawn', label: 'Lawn', season: 'Summer', description: 'Light cotton, perfect for summer' },
  { value: 'chiffon', label: 'Chiffon', season: 'All', description: 'Light, sheer fabric' },
  { value: 'silk', label: 'Silk', season: 'All', description: 'Luxurious natural fiber' },
  { value: 'cotton', label: 'Cotton', season: 'All', description: 'Breathable and comfortable' },
  { value: 'velvet', label: 'Velvet', season: 'Winter', description: 'Rich, plush fabric' },
  { value: 'organza', label: 'Organza', season: 'All', description: 'Sheer, crisp fabric' },
  { value: 'khaddar', label: 'Khaddar', season: 'Winter', description: 'Winter cotton fabric' },
  { value: 'karandi', label: 'Karandi', season: 'Winter', description: 'Medium-weight cotton' },
  { value: 'linen', label: 'Linen', season: 'Summer', description: 'Natural, breathable fabric' },
  { value: 'jacquard', label: 'Jacquard', season: 'All', description: 'Woven patterned fabric' },
  { value: 'jamawar', label: 'Jamawar', season: 'Winter', description: 'Traditional brocade fabric' }
];

/**
 * Different occasions for clothing
 */
export const OCCASIONS = [
  { value: 'bridal', label: 'Bridal', icon: '💍' },
  { value: 'party-wear', label: 'Party Wear', icon: '🎉' },
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'formal', label: 'Formal', icon: '👔' },
  { value: 'mehndi', label: 'Mehndi', icon: '🎨' },
  { value: 'walima', label: 'Walima', icon: '💐' },
  { value: 'eid', label: 'Eid Collection', icon: '🌙' },
  { value: 'winter', label: 'Winter Collection', icon: '❄️' },
  { value: 'summer', label: 'Summer Collection', icon: '☀️' }
];

/**
 * Product sorting options
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' }
];

/**
 * Sizes
 */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

/**
 * Colors (Common Pakistani fashion colors)
 */
export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Maroon', hex: '#991B1B' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Peach', hex: '#FBBF24' },
  { name: 'Teal', hex: '#14B8A6' }
];

// ============================================================================
// MEASUREMENTS
// ============================================================================

/**
 * Measurement fields grouped by body part
 * All measurements in centimeters
 */
export const MEASUREMENT_FIELDS = {
  upperBody: [
    { key: 'shirtLength', label: 'Shirt Length', min: 20, max: 100 },
    { key: 'shoulderWidth', label: 'Shoulder Width', min: 10, max: 60 },
    { key: 'sleeveLength', label: 'Sleeve Length', min: 15, max: 80 },
    { key: 'armHole', label: 'Arm Hole', min: 10, max: 50 },
    { key: 'bust', label: 'Bust', min: 30, max: 150 },
    { key: 'waist', label: 'Waist', min: 25, max: 140 },
    { key: 'hip', label: 'Hip', min: 30, max: 160 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', min: 5, max: 30 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', min: 5, max: 30 },
    { key: 'wrist', label: 'Wrist', min: 5, max: 25 }
  ],
  lowerBody: [
    { key: 'trouserLength', label: 'Trouser Length', min: 30, max: 120 },
    { key: 'trouserWaist', label: 'Trouser Waist', min: 25, max: 140 },
    { key: 'trouserHip', label: 'Trouser Hip', min: 30, max: 160 },
    { key: 'thigh', label: 'Thigh', min: 15, max: 80 },
    { key: 'bottom', label: 'Bottom', min: 15, max: 60 },
    { key: 'kneeLength', label: 'Knee Length', min: 20, max: 80 }
  ],
  dupatta: [
    { key: 'dupattaLength', label: 'Dupatta Length', min: 200, max: 300 },
    { key: 'dupattaWidth', label: 'Dupatta Width', min: 80, max: 120 }
  ]
};

export const MEASUREMENT_TYPES = {
  KAMEEZ: 'kameez',
  SHALWAR: 'shalwar',
  TROUSER: 'trouser',
  BLOUSE: 'blouse',
  SKIRT: 'skirt',
  SHIRT: 'shirt'
};

// ============================================================================
// LOCATION & SHIPPING
// ============================================================================

/**
 * Major cities in Pakistan where we deliver
 * Grouped by province for better organization
 */
export const CITIES_PAKISTAN = {
  Punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala',
    'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Sheikhupura'
  ],
  Sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'
  ],
  KPK: [
    'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat'
  ],
  Balochistan: [
    'Quetta', 'Gwadar', 'Khuzdar', 'Turbat'
  ],
  Federal: [
    'Islamabad'
  ]
};

/**
 * Flat list of all cities
 */
export const ALL_CITIES = Object.values(CITIES_PAKISTAN).flat();

/**
 * Shipping zones and charges
 */
export const SHIPPING_ZONES = {
  LAHORE: { name: 'Lahore', charges: 150, days: '1-2' },
  ISLAMABAD: { name: 'Islamabad/Rawalpindi', charges: 200, days: '2-3' },
  KARACHI: { name: 'Karachi', charges: 250, days: '3-4' },
  PUNJAB: { name: 'Punjab (Other)', charges: 200, days: '2-4' },
  SINDH: { name: 'Sindh (Other)', charges: 250, days: '3-5' },
  KPK: { name: 'KPK', charges: 300, days: '4-6' },
  BALOCHISTAN: { name: 'Balochistan', charges: 350, days: '5-7' },
  AJK: { name: 'AJK', charges: 300, days: '4-6' }
};

// ============================================================================
// CURRENCY & FORMATTING
// ============================================================================

export const CURRENCY = {
  code: 'PKR',
  symbol: 'Rs.',
  locale: 'en-PK'
};

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'hh:mm a',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
};

// ============================================================================
// VALIDATION & REGEX
// ============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PK: /^(\+92|0)?3[0-9]{9}$/,
  CNIC: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
  POSTAL_CODE: /^[0-9]{5}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_REVIEW_LENGTH: 500,
  MAX_ADDRESS_LENGTH: 200,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  MAX_IMAGES_PER_UPLOAD: 5,
  MAX_AD_IMAGES: 10,
  MAX_AD_TITLE_LENGTH: 100,
  MAX_AD_DESCRIPTION_LENGTH: 2000
};

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxFiles: 10
};

// ============================================================================
// SEO CONFIGURATION
// ============================================================================

/**
 * SEO defaults
 */
export const SEO_DEFAULTS = {
  titleTemplate: '%s | LaraibCreative',
  defaultTitle: 'LaraibCreative - Custom Stitching & Premium Pakistani Fashion',
  description: 'Premium custom stitching and tailoring services in Pakistan. Expert craftsmanship for bridal wear, party wear, and casual outfits. Shop unstitched and ready-to-wear collections online.',
  keywords: 'Pakistani fashion, custom stitching, online clothing Pakistan, designer wear, formal dresses, casual wear, Lahore fashion, bridal wear Pakistan',
  ogImage: `${SITE_URL}/images/og-default.jpg`,
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    site_name: 'LaraibCreative'
  },
  twitter: {
    handle: '@laraibcreative',
    cardType: 'summary_large_image'
  }
};

// ============================================================================
// CONTACT & SOCIAL
// ============================================================================

/**
 * Contact information
 */
export const CONTACT_INFO = {
  phone: '03020718182',
  whatsapp: '03020718182',
  email: 'laraibcreative.business@gmail.com',
  supportEmail: 'laraibcreative.business@gmail.com',
  address: 'Your Address, Lahore, Punjab, Pakistan',
  businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM'
};

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/laraibcreative',
  instagram: 'https://instagram.com/laraibcreative',
  twitter: 'https://twitter.com/laraibcreative',
  pinterest: 'https://pinterest.com/laraibcreative',
  youtube: 'https://youtube.com/@laraibcreative',
  whatsapp: 'https://wa.me/923020718182'
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user-data',
  CART: 'cart',
  WISHLIST: 'wishlist',
  RECENT_VIEWS: 'recent-views',
  THEME: 'theme',
  LANGUAGE: 'language',
  FILTERS: 'product-filters',
  MEASUREMENTS: 'saved-measurements',
  SEARCH_HISTORY: 'search-history'
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  CUSTOM_ORDERS: true,
  WISHLIST: true,
  REVIEWS: true,
  BLOG: true,
  ADS_POSTING: true,
  LIVE_CHAT: false,
  NOTIFICATIONS: true,
  MEASUREMENT_GUIDE: true,
  SIZE_RECOMMENDATION: true,
  VIRTUAL_TRY_ON: false,
  GIFT_CARDS: false,
  LOYALTY_PROGRAM: false,
  MULTI_CURRENCY: false,
  GUEST_CHECKOUT: true
};

// ============================================================================
// CACHE & PERFORMANCE
// ============================================================================

export const CACHE_TTL = {
  PRODUCTS: 300, // 5 minutes
  CATEGORIES: 3600, // 1 hour
  BLOG_POSTS: 600, // 10 minutes
  ADS: 180, // 3 minutes
  USER_DATA: 900, // 15 minutes
  STATIC_PAGES: 86400 // 24 hours
};

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 200
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// ============================================================================
// ERROR & SUCCESS MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  AD_LIMIT_REACHED: 'You have reached your ad posting limit.'
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully!',
  LOGOUT: 'Logged out successfully!',
  REGISTER: 'Account created successfully!',
  UPDATE_PROFILE: 'Profile updated successfully!',
  ADD_TO_CART: 'Added to cart!',
  REMOVE_FROM_CART: 'Removed from cart!',
  ORDER_PLACED: 'Order placed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  AD_POSTED: 'Ad posted successfully!',
  AD_UPDATED: 'Ad updated successfully!',
  AD_DELETED: 'Ad deleted successfully!'
};

// ============================================================================
// TOAST CONFIGURATION
// ============================================================================

export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff'
  }
};

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMITS = {
  SEARCH: { requests: 10, window: 60000 }, // 10 per minute
  LOGIN: { requests: 5, window: 900000 }, // 5 per 15 minutes
  CONTACT: { requests: 3, window: 3600000 }, // 3 per hour
  AD_POSTING: { requests: 5, window: 3600000 }, // 5 per hour
  API: { requests: 100, window: 60000 } // 100 per minute
};

// ============================================================================
// APPLICATION ROUTES
// ============================================================================

/**
 * Application routes
 */
export const ROUTES = {
  home: '/',
  products: '/products',
  productDetail: '/products/[id]',
  ads: '/ads',
  adDetail: '/ads/[id]',
  postAd: '/ads/create',
  cart: '/cart',
  checkout: '/checkout',
  account: '/account',
  profile: '/account/profile',
  orders: '/account/orders',
  measurements: '/account/measurements',
  addresses: '/account/addresses',
  wishlist: '/account/wishlist',
  myAds: '/account/my-ads',
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  blog: '/blog',
  blogPost: '/blog/[slug]',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  sizeGuide: '/size-guide',
  trackOrder: '/track-order',
  // Admin Routes
  admin: '/admin/dashboard',
  adminProducts: '/admin/products',
  adminOrders: '/admin/orders',
  adminCustomers: '/admin/customers',
  adminAds: '/admin/ads',
  adminContent: '/admin/content',
  adminSEO: '/admin/settings/seo',
  adminAnalytics: '/admin/reports'
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const constants = {
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  API_BASE_URL,
  SITE_URL,
  SITE_NAME,
  SEO_DEFAULTS,
  IMAGE_SIZES,
  IMAGE_QUALITY,
  PAGINATION,
  ORDER_STATUSES,
  ORDER_STATUS_SEQUENCE,
  AD_STATUS,
  AD_CATEGORIES,
  AD_DURATION,
  PAYMENT_METHODS,
  USER_ROLES,
  PRODUCT_CATEGORIES,
  FABRIC_TYPES,
  OCCASIONS,
  MEASUREMENT_FIELDS,
  CITIES_PAKISTAN,
  ALL_CITIES,
  SHIPPING_ZONES,
  CURRENCY,
  DATE_FORMATS,
  REGEX_PATTERNS,
  STORAGE_KEYS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  FEATURES,
  CACHE_TTL,
  ANIMATION,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOAST_CONFIG,
  RATE_LIMITS,
  ROUTES,
  VALIDATION,
  FILE_UPLOAD,
  COLORS,
  SIZES,
  SORT_OPTIONS
};

export default constants;