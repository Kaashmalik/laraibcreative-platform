/**
 * Order Types
 * Matches backend Order model structure
 */

export interface OrderItem {
  product: {
    _id: string;
    title: string;
    slug: string;
    designCode: string;
    images: Array<{ url: string; alt?: string }>;
    pricing: {
      basePrice: number;
      discount?: { percentage: number; amount: number; isActive: boolean };
    };
  };
  quantity: number;
  customDetails?: {
    size?: string;
    color?: string;
    fabric?: string;
    stitchingType?: string;
    measurements?: {
      bust?: number;
      waist?: number;
      hips?: number;
      shoulder?: number;
      sleeveLength?: number;
      shirtLength?: number;
      trouserLength?: number;
      trouserWaist?: number;
      neck?: number;
      armHole?: number;
      wrist?: number;
    };
    notes?: string;
  };
  priceAtOrder: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  whatsapp?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}

export interface PaymentInfo {
  method: 'cod' | 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'card';
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  receiptImage?: {
    url: string;
    publicId: string;
  };
  transactionId?: string;
  transactionDate?: Date;
  advanceAmount?: number;
  remainingAmount?: number;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export type OrderStatus = 
  | 'pending-payment'
  | 'payment-verified'
  | 'material-arranged'
  | 'stitching-in-progress'
  | 'quality-check'
  | 'ready-for-dispatch'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  pricing: OrderPricing;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  specialInstructions?: string;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: Date;
  estimatedCompletion?: Date;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface OrderListResponse {
  success: boolean;
  data: {
    orders: OrderListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}
