// Order status mirrors OrderStatus.java enum
export type OrderStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

// ServiceType mirrors ServiceType.java entity
export interface ServiceType {
  id: number;
  name: string;
  pricePerUnit: number;
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

// Full Order response from GET /api/orders or GET /api/orders/:id
export interface Order {
  id: number;
  serviceTypeName: string;
  addressCity: string;
  pickupTime: string;          // ISO-8601 string from backend
  orderStatus: OrderStatus;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;           // ISO-8601 string
}

export interface CreateOrderRequest {
  serviceTypeId: number;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  pickupTime: string;          // ISO-8601 string
  totalAmount: number;
  specialInstructions?: string;
}

// For PATCH /api/orders/:id/status
export interface StatusUpdateRequest {
  orderStatus: OrderStatus;
}

// Auth types
export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'WASHER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
  businessId: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessId: number;
}

// Chat types
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
