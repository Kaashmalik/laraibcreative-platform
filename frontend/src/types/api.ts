/**
 * API Response Types
 * Standardized response structures for backend API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      _id: string;
      fullName: string;
      email: string;
      phone: string;
      role: string;
      profileImage?: string;
    };
  };
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    size?: number;
    mimetype?: string;
  };
  message?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  data?: {
    uploaded: number;
    failed: number;
    errors: Array<{
      filename?: string;
      error: string;
    }>;
  };
  message?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: {
    revenue: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      dailyRevenue: Array<{
        _id: string;
        revenue: number;
        orders: number;
      }>;
    };
    customers: {
      totalCustomers: number;
      repeatCustomers: number;
      repeatRate: number;
      averageLTV: number;
    };
    conversion: {
      conversionRate: number;
      abandonedCarts: number;
    };
    products: {
      topProducts: Array<{
        productName: string;
        totalSold: number;
        revenue: number;
      }>;
    };
    alerts?: {
      payments?: { count: number };
      stockouts?: { count: number };
      abandonment?: { abandonmentRate: number };
    };
  };
  message?: string;
}
