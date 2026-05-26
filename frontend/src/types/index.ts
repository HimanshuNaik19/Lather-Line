// Order status mirrors OrderStatus.java enum
export type OrderStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

// Pricing unit for a service
export type ServiceUnit = 'KG' | 'PIECE';

// ServiceType mirrors ServiceType.java entity
export interface ServiceType {
  id: number;
  businessId?: number;
  name: string;
  pricePerUnit: number;
  unit: ServiceUnit;
  turnaroundHours?: number;
  description: string;
  active: boolean;
}

// Address mirrors Address.java entity
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// A single line in an order
export interface OrderItem {
  serviceTypeId: number;
  serviceName: string;
  unit: ServiceUnit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  label?: string;
}

// Full Order response from backend
export interface Order {
  publicId: string;
  customerName?: string;      // present in admin/staff views
  customerPhone?: string;
  items: OrderItem[];
  addressCity: string;
  addressStreet?: string;
  pickupTime: string;          // ISO-8601
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;           // ISO-8601
}

// Per-item payload for creating an order
export interface OrderItemRequest {
  serviceTypeId: number;
  quantity: number;
  label?: string;
}

// Customer online order creation
export interface CreateOrderRequest {
  items: OrderItemRequest[];
  street: string;
  city: string;
  state: string;
  pinCode: string;
  pickupTime: string;          // ISO-8601
  specialInstructions?: string;
}

// Walk-in POS order creation (staff)
export interface PosCreateRequest {
  customerPhone: string;
  customerName: string;
  items: OrderItemRequest[];
  specialInstructions?: string;
}

// For PATCH /api/orders/:publicId/status
export interface StatusUpdateRequest {
  orderStatus: OrderStatus;
}

// Auth types
export interface AuthResponse {
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'WASHER' | 'MANAGER' | 'ADMIN';
  businessId: number;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessCode: string;
}

// Chat types
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
