/**
 * Order Management TypeScript Types
 * Complete type definitions for order management system
 */

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

export type PaymentMethod = 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod';

export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export type Priority = 'normal' | 'high' | 'urgent';

export interface OrderItem {
  _id?: string;
  product: string | ProductSnapshot;
  productSnapshot: ProductSnapshot;
  isCustom: boolean;
  customDetails?: CustomOrderDetails;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ProductSnapshot {
  title: string;
  sku?: string;
  primaryImage?: string;
  description?: string;
  category?: string;
  fabricType?: string;
}

export interface CustomOrderDetails {
  serviceType: 'fully-custom' | 'brand-article-copy';
  measurements?: Record<string, string>;
  referenceImages?: Array<{
    url: string;
    caption?: string;
    uploadedAt?: Date;
  }>;
  fabric?: {
    providedBy: 'customer' | 'laraibcreative';
    type?: string;
    color?: string;
    quality?: string;
    metersRequired?: number;
  };
  specialInstructions?: string;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
  estimatedDays?: number;
  rushOrder?: boolean;
}

export interface ShippingAddress {
  fullAddress?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  bankDetails?: {
    accountTitle?: string;
    accountNumber?: string;
    bankName?: string;
    branch?: string;
  };
  receiptImage?: {
    url: string;
    cloudinaryId?: string;
    uploadedAt?: Date;
  };
  transactionId?: string;
  transactionDate?: Date;
  amountPaid?: number;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  codCollected?: boolean;
  codCollectedAt?: Date;
  refund?: {
    amount: number;
    reason: string;
    processedAt: Date;
    processedBy: string;
  };
}

export interface OrderPricing {
  subtotal: number;
  shippingCharges: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
}

export interface StatusHistoryItem {
  _id?: string;
  status: OrderStatus;
  note?: string;
  updatedBy?: string;
  timestamp: Date;
}

export interface TrackingInfo {
  courierService?: 'TCS' | 'Leopards' | 'M&P' | 'BlueEx' | 'Trax' | 'Call Courier' | 'Self-Pickup' | 'Other';
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveryProof?: {
    image?: string;
    recipientName?: string;
    signature?: string;
  };
}

export interface AdminNote {
  _id?: string;
  text: string;
  addedBy: string;
  isImportant?: boolean;
  timestamp: Date;
}

export interface CancellationInfo {
  cancelledBy?: 'customer' | 'admin';
  reason?: string;
  requestedAt?: Date;
  approvedAt?: Date;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  tracking?: TrackingInfo;
  payment: PaymentInfo;
  pricing: OrderPricing;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  assignedTailor?: string;
  priority: Priority;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  notes: AdminNote[];
  tags?: string[];
  customerRating?: {
    rating: number;
    review?: string;
    reviewedAt?: Date;
  };
  cancellation?: CancellationInfo;
  issues?: Array<{
    type: 'measurement-issue' | 'fabric-issue' | 'quality-issue' | 'delay' | 'damage' | 'other';
    description: string;
    reportedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  }>;
  source?: 'website' | 'whatsapp' | 'instagram' | 'phone' | 'walk-in';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  paymentMethod?: PaymentMethod | 'all';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  customer?: string;
  search?: string;
  priority?: Priority | 'all';
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      ordersPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface StatusUpdateRequest {
  status: OrderStatus;
  note?: string;
  notifyCustomer?: boolean;
}

export interface PaymentVerificationRequest {
  verified: boolean;
  verificationNotes?: string;
  transactionId?: string;
  transactionDate?: Date;
  amountPaid?: number;
}

export interface CancelOrderRequest {
  reason: string;
  refundAmount?: number;
  notifyCustomer?: boolean;
}

export interface RefundRequest {
  reason: string;
  amount: number;
  items?: string[]; // Order item IDs to refund
  notifyCustomer?: boolean;
}

export interface ShippingAddressUpdate {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface AdminNoteRequest {
  text: string;
  isImportant?: boolean;
}

export interface TrackingUpdate {
  courierService: string;
  trackingNumber: string;
  trackingUrl?: string;
  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
}

