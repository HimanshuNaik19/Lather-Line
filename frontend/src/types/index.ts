// Order status mirrors OrderStatus.java enum
export type OrderStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod = 
  | 'ONLINE'
  | 'CASH'
  | 'PAY_LATER';

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

// Coupons and Subscriptions
export interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  validUntil?: string;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  includedKg: number;
  includedPieces: number;
  isActive: boolean;
}

export interface UserSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string;
  remainingKg: number;
  remainingPieces: number;
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
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  couponCode?: string;
  specialInstructions?: string;
  createdAt: string;           // ISO-8601
  driverName?: string;
  driverId?: number;
  addressLatitude?: number;
  addressLongitude?: number;
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
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

// Walk-in POS order creation (staff)
export interface PosCreateRequest {
  customerPhone: string;
  customerName: string;
  items: OrderItemRequest[];
  specialInstructions?: string;
  couponCode?: string;
}

// For PATCH /api/orders/:publicId/status
export interface StatusUpdateRequest {
  orderStatus: OrderStatus;
}

// Auth types
export interface AuthResponse {
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'WASHER' | 'MANAGER' | 'ADMIN' | 'DRIVER';
  businessId: number;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateDriverRequest {
  fullName: string;
  phone: string;
  password?: string;
}

// ── Inventory & Expenses ──────────────────────────────────────────────────

export interface InventoryItem {
  id: number;
  businessId?: number;
  name: string;
  unit: string;
  quantityInStock: number;
  costPerUnit: number;
  lowStockThreshold: number;
}

export interface ServiceInventoryRequirement {
  id: number;
  serviceType: ServiceType;
  inventoryItem: InventoryItem;
  quantityRequired: number;
}

export interface Expense {
  id: number;
  businessId?: number;
  amount: number;
  category: string;
  expenseDate: string; // YYYY-MM-DD
  description: string;
}

export interface ProfitabilityReport {
  totalRevenue: number;
  totalCogs: number;
  totalOperatingExpenses: number;
  netProfit: number;
  profitMarginPercentage: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessCode: string;
}

export interface RegisterBusinessRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessCode: string;
  contactEmail?: string;
  addressText?: string;
}

// Chat types
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
