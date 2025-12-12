/**
 * API Type Definitions
 * Centralized types for API responses and requests
 */

// ============================================
// BASE TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp?: string;
  requestId?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Cursor-based pagination response
 */
export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
  cursor: {
    next: string | null;
    previous: string | null;
    hasMore: boolean;
  };
}

// ============================================
// ENTITY TYPES
// ============================================

/**
 * User profile
 */
export interface User {
  _id: string;
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  whatsapp?: string;
  profileImage?: string;
  role: 'customer' | 'admin' | 'super-admin';
  customerType: 'new' | 'returning' | 'vip';
  isActive: boolean;
  emailVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  addresses?: Address[];
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label?: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  newsletter: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

/**
 * Product types
 */
export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  designCode: string;
  category: string | Category;
  subcategory?: string;
  occasion?: string;
  tags: string[];
  images: ProductImage[];
  primaryImage: string;
  thumbnailImage?: string;
  availableColors: ProductColor[];
  fabric: Fabric;
  pricing: Pricing;
  customization: Customization;
  sizeAvailability: SizeAvailability;
  productType: 'ready-made' | 'custom-only' | 'both';
  type: 'ready-made' | 'replica' | 'karhai' | 'hand-karhai';
  embroideryDetails?: EmbroideryDetails;
  suitComponents: SuitComponents;
  availability: {
    status: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued';
    expectedRestockDate?: string;
  };
  features: string[];
  whatsIncluded: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  views: number;
  averageRating: number;
  totalReviews: number;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  displayOrder: number;
  imageType: 'front' | 'back' | 'side' | 'detail' | 'closeup' | 'dupatta' | 'trouser' | 'full-set' | 'model' | 'flat-lay' | 'other';
  caption?: string;
}

export interface ProductColor {
  name: string;
  hexCode?: string;
  image?: string;
  inStock: boolean;
}

export interface Fabric {
  type: string;
  composition?: string;
  weight?: 'Light' | 'Medium' | 'Heavy';
  care?: string;
  stretchable: boolean;
  texture?: string;
}

export interface Pricing {
  basePrice: number;
  customStitchingCharge: number;
  brandArticleCharge: number;
  fabricProvidedByLC: number;
  rushOrderFee: number;
  discount: {
    percentage: number;
    amount: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
  currency: 'PKR' | 'USD';
}

export interface Customization {
  allowFullyCustom: boolean;
  allowBrandArticle: boolean;
  allowOwnFabric: boolean;
  maxReferenceImages: number;
  availableAddOns: AddOn[];
  estimatedStitchingDays: number;
}

export interface AddOn {
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface SizeAvailability {
  standardSizes: string[];
  customSizeOnly: boolean;
  measurementGuide?: string;
}

export interface EmbroideryDetails {
  workType: string;
  complexity: string;
  coverage: string;
  placement: string[];
  estimatedHours: number;
  additionalCost: number;
  description?: string;
  threadColors: string[];
}

export interface SuitComponents {
  shirt: SuitComponent;
  dupatta: SuitComponent;
  trouser: SuitComponent;
}

export interface SuitComponent {
  included: boolean;
  length?: string;
  fabric?: string;
  description?: string;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  focusKeyword?: string;
  ogImage?: string;
}

/**
 * Category types
 */
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | Category;
  level: number;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order types
 */
export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | User;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  pricing: OrderPricing;
  payment: Payment;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  priority?: 'normal' | 'rush' | 'urgent';
  estimatedCompletion?: string;
  actualCompletion?: string;
  tracking?: Tracking;
  notes: OrderNote[];
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  customizations?: {
    size?: string;
    measurements?: Record<string, number>;
    color?: string;
    addOns?: string[];
    referenceImages?: string[];
    notes?: string;
  };
}

export interface ShippingAddress {
  fullAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  landmark?: string;
}

export interface OrderPricing {
  subtotal: number;
  customizationTotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Payment {
  method: 'cod' | 'bank-transfer' | 'easypaisa' | 'jazzcash';
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  receiptImage?: { url: string; publicId?: string };
  transactionId?: string;
  transactionDate?: string;
  advanceAmount?: number;
  remainingAmount?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  refund?: {
    amount: number;
    reason: string;
    processedAt: string;
  };
}

export type OrderStatus = 
  | 'pending-payment'
  | 'payment-verified'
  | 'material-arranged'
  | 'in-progress'
  | 'quality-check'
  | 'ready-dispatch'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Tracking {
  courierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
}

export interface OrderNote {
  text: string;
  addedBy: string;
  timestamp: string;
  isImportant?: boolean;
}

/**
 * Review types
 */
export interface Review {
  _id: string;
  product: string | Product;
  user: string | User;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

/**
 * Cart types
 */
export interface CartItem {
  product: string | Product;
  quantity: number;
  customizations?: Record<string, unknown>;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  referralCode?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    product: string;
    quantity: number;
    customizations?: Record<string, unknown>;
  }>;
  shippingAddress: ShippingAddress;
  payment: {
    method: Payment['method'];
    receiptImage?: { url: string };
    transactionId?: string;
    advanceAmount?: number;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  specialInstructions?: string;
}

export interface ProductFilterParams {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  fabric?: string;
  occasion?: string;
  color?: string;
  size?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface AuthResponse extends ApiResponse<{
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}> {}

export interface ProductResponse extends ApiResponse<{
  product: Product;
}> {}

export interface ProductsResponse extends PaginatedResponse<Product> {
  products: Product[];
}

export interface OrderResponse extends ApiResponse<{
  order: Order;
}> {}

export interface OrdersResponse extends PaginatedResponse<Order> {
  orders: Order[];
}

export interface CategoryResponse extends ApiResponse<{
  category: Category;
}> {}

export interface CategoriesResponse extends ApiResponse<{
  categories: Category[];
}> {}

export default {};

