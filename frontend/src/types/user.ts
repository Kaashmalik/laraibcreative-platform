/**
 * User/Customer Types
 * Matches backend User model structure
 */

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  role: 'customer' | 'admin' | 'super-admin';
  profileImage?: string;
  profileImagePublicId?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    newsletter: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'office' | 'other';
}

export interface Measurements {
  userId?: string;
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
  notes?: string;
  updatedAt: Date;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CustomerProfileResponse {
  success: boolean;
  data: CustomerProfile;
  message?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  whatsapp?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    newsletter?: boolean;
    smsNotifications?: boolean;
    whatsappNotifications?: boolean;
  };
}
