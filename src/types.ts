export type UserRole = 'Customer' | 'Admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isFeatured: boolean;
  rating: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stockAvailable: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  estimatedTax: number;
  shippingFee: number;
  totalAmount: number;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  cardHolderName: string;
  cardNumberMasked: string;
  expiryMonth: string;
  expiryYear: string;
  brand: string;
  isDefault: boolean;
  createdAt: string;
}

export interface OrderMilestone {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  status: string;
  orderDate: string;
  shippingAddress: string;
  milestones: OrderMilestone[];
}
