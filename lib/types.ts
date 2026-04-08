// =====================================================
// Core Types
// =====================================================

export type PlaceType = 'resort' | 'nature';
export type UserRole = 'user' | 'manager' | 'super_admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'stripe' | 'qpay';

// =====================================================
// Database Types
// =====================================================

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  description: string | null;
  short_desc: string | null;
  price_per_night: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  province: string | null;
  district: string | null;
  cover_image: string | null;
  images: string[];
  video_url: string | null;
  view_count: number;
  like_count: number;
  rating_avg: number;
  rating_count: number;
  is_published: boolean;
  is_featured: boolean;
  manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  manager?: Profile;
  reviews?: Review[];
}

export interface Booking {
  id: string;
  place_id: string;
  user_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  guest_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_intent: string | null;
  qpay_invoice_id: string | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  place?: Place;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string | null;
  booking_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  is_verified: boolean;
  created_at: string;
  // Relations
  user?: Profile;
}

export interface Like {
  user_id: string;
  place_id: string;
  created_at: string;
}

// =====================================================
// Form Types
// =====================================================

export interface PlaceFormData {
  type: PlaceType;
  name: string;
  description: string;
  short_desc: string;
  price_per_night?: number;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  province?: string;
  district?: string;
  cover_image?: string;
  images?: string[];
  video_url?: string;
  is_published: boolean;
  is_featured: boolean;
  manager_id?: string;
}

export interface BookingFormData {
  place_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  guest_count: number;
  check_in: string;
  check_out: string;
  payment_method: PaymentMethod;
  notes?: string;
}

// =====================================================
// API Response Types
// =====================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PlacesFilter {
  type?: PlaceType;
  search?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'price_per_night' | 'rating_avg' | 'view_count';
  sortOrder?: 'asc' | 'desc';
}

// =====================================================
// Payment Types
// =====================================================

export interface StripePaymentIntent {
  client_secret: string;
  payment_intent_id: string;
}

export interface QPayInvoice {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  urls: Array<{
    name: string;
    description: string;
    logo: string;
    link: string;
  }>;
}

// =====================================================
// Stats Types
// =====================================================

export interface SiteStats {
  total_views: number;
  total_places: number;
  total_resorts: number;
  total_nature: number;
  total_users: number;
  total_bookings: number;
}

// =====================================================
// Mongolian Provinces
// =====================================================

export const MONGOLIAN_PROVINCES = [
  'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай',
  'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь',
  'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар',
  'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий', 'Улаанбаатар'
] as const;

export type MongolianProvince = typeof MONGOLIAN_PROVINCES[number];
