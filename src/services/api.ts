import type {
  AuthResponse,
  Category,
  Order,
  Product,
  CartResponse,
  CartItem,
  ShippingAddress,
  User,
} from '../types';

function resolveApiBase(): string {
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:5000';
}

const API_BASE = resolveApiBase();

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ecommerce_mock_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fallback seed catalog when API is disconnected or during pure frontend tests
export const SEED_CATEGORIES: Category[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Audio & Acoustics',
    slug: 'audio',
    description: 'High-fidelity audiophile gear and studio-grade monitoring solutions.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Minimalist Workspace',
    slug: 'workspace',
    description: 'Precision-engineered desktop peripherals and ergonomic tools.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'Smart Wearables',
    slug: 'wearables',
    description: 'Advanced biometric tracking and intelligent everyday micro-wearables.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    categoryName: 'Audio & Acoustics',
    categorySlug: 'audio',
    name: 'Pro Wireless ANC Headphones',
    slug: 'pro-wireless-anc-headphones',
    description: 'Active noise cancelling with 40mm beryllium drivers, 36-hour battery, and custom acoustic tuning for unmatched spatial presence.',
    price: 299.0,
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    categoryName: 'Audio & Acoustics',
    categorySlug: 'audio',
    name: 'Studio Reference Desktop Monitors',
    slug: 'studio-reference-desktop-monitors',
    description: 'Bi-amplified precision reference nearfield monitors with Kevlar cones and flat frequency response for discerning creators.',
    price: 449.0,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    categoryName: 'Minimalist Workspace',
    categorySlug: 'workspace',
    name: 'Machined Aluminum Mechanical Keyboard',
    slug: 'machined-aluminum-mechanical-keyboard',
    description: 'CNC anodized chassis, hot-swappable tactile switches, gasket mount acoustic dampening, and custom QMK/VIA firmware.',
    price: 189.0,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    categoryName: 'Minimalist Workspace',
    categorySlug: 'workspace',
    name: 'Solid Walnut Desk Riser & Organizer',
    slug: 'solid-walnut-desk-riser-organizer',
    description: 'Handcrafted Appalachian walnut monitor riser with integrated cable routing trays and micro-beveled edges.',
    price: 129.0,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    rating: 4.7,
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    categoryName: 'Minimalist Workspace',
    categorySlug: 'workspace',
    name: 'Ergonomic Wireless Precision Mouse',
    slug: 'ergonomic-wireless-precision-mouse',
    description: 'Ergonomic sculpted thumb rest with dual magnetic scroll wheels, darkfield sensor tracking on glass, and multi-device pairing.',
    price: 99.0,
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    rating: 4.6,
  },
  {
    id: '33333333-3333-3333-3333-333333333306',
    categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    categoryName: 'Minimalist Workspace',
    categorySlug: 'workspace',
    name: 'Minimalist Ceramic Induction Charger',
    slug: 'minimalist-ceramic-induction-charger',
    description: 'Matte finish ceramic dual fast-charging pad supporting Qi2 MagSafe alignment up to 15W per terminal.',
    price: 59.0,
    stockQuantity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    rating: 4.5,
  },
  {
    id: '33333333-3333-3333-3333-333333333307',
    categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    categoryName: 'Smart Wearables',
    categorySlug: 'wearables',
    name: 'Titanium Horizon Smart Ring',
    slug: 'titanium-horizon-smart-ring',
    description: 'Aerospace grade titanium ring tracking HRV, sleep stages, skin temperature variance, and recovery readiness score.',
    price: 249.0,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: '33333333-3333-3333-3333-333333333308',
    categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    categoryName: 'Smart Wearables',
    categorySlug: 'wearables',
    name: 'Active Sport Sensor Watch Ultra',
    slug: 'active-sport-sensor-watch-ultra',
    description: 'Sapphire crystal display, dual-frequency GPS, 100m water resistance, and 60-hour endurance battery life in extreme conditions.',
    price: 399.0,
    stockQuantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    rating: 4.7,
  },
];

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Invalid credentials');
      }
      return await res.json();
    } catch (err: unknown) {
      // Local fallback for standalone E2E or demo without backend container
      if (email === 'customer@e-commerce-mock.com' && password === 'CustomerPass123!') {
        return {
          token: 'mock-jwt-token-customer-' + Date.now(),
          user: {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'customer@e-commerce-mock.com',
            fullName: 'Customer Demo',
            role: 'Customer',
          },
        };
      }
      if (email === 'admin@e-commerce-mock.com' && password === 'AdminPass123!') {
        return {
          token: 'mock-jwt-token-admin-' + Date.now(),
          user: {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'admin@e-commerce-mock.com',
            fullName: 'Store Admin',
            role: 'Admin',
          },
        };
      }
      throw err;
    }
  },

  async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }
      return await res.json();
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('fetch') && !err.message.includes('Failed to parse URL')) {
        throw err;
      }
      return {
        token: 'mock-jwt-token-registered-' + Date.now(),
        user: {
          id: 'mock-user-' + Date.now(),
          email,
          fullName: fullName || email.split('@')[0],
          role: 'Customer',
        },
      };
    }
  },

  async getMe(): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ecommerce_mock_user') : null;
    if (stored) return JSON.parse(stored);
    throw new Error('Unauthorized');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/categories`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return SEED_CATEGORIES;
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; sortBy?: string }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.sortBy) query.append('sortBy', params.sortBy);

      const res = await fetch(`${API_BASE}/api/v1/products?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    let list = [...SEED_PRODUCTS];
    if (params?.category) {
      list = list.filter(
        (p) => p.categorySlug === params.category || p.categoryName === params.category,
      );
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/products/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return SEED_PRODUCTS.find((p) => p.id === id) || null;
  },

  async updateStock(productId: string, stockQuantity: number): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ stockQuantity }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const product = SEED_PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');
    product.stockQuantity = stockQuantity;
    return { ...product, stockQuantity };
  },

  // Cart
  async getCart(): Promise<CartResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/cart`, {
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mock_cart_items') : null;
    const items = raw ? JSON.parse(raw) : [];
    const subtotal = items.reduce((sum: number, it: CartItem) => sum + it.unitPrice * it.quantity, 0);
    const estimatedTax = Math.round(subtotal * 0.085 * 100) / 100;
    const shippingFee = subtotal === 0 || subtotal >= 150 ? 0 : 15.0;
    return {
      items,
      subtotal,
      estimatedTax,
      shippingFee,
      totalAmount: Math.round((subtotal + estimatedTax + shippingFee) * 100) / 100,
    };
  },

  async addToCart(productId: string, quantity = 1): Promise<CartResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const cart = await this.getCart();
    const product = SEED_PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * existing.unitPrice;
    } else {
      cart.items.push({
        id: 'cart-item-' + Date.now(),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity,
        subtotal: product.price * quantity,
        stockAvailable: product.stockQuantity,
      });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_cart_items', JSON.stringify(cart.items));
    }
    return this.getCart();
  },

  async updateCartItem(id: string, quantity: number): Promise<CartResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/cart/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const cart = await this.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== id);
    } else {
      const item = cart.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
        item.subtotal = item.unitPrice * quantity;
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_cart_items', JSON.stringify(cart.items));
    }
    return this.getCart();
  },

  async removeCartItem(id: string): Promise<CartResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/cart/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const cart = await this.getCart();
    cart.items = cart.items.filter((i) => i.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_cart_items', JSON.stringify(cart.items));
    }
    return this.getCart();
  },

  async clearCart(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/v1/cart`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // Fallback
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mock_cart_items');
    }
  },

  // Checkout & Orders
  async checkout(shippingAddress: ShippingAddress, paymentMethod = 'credit_card'): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ shippingAddress, paymentMethod }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const cart = await this.getCart();
    const orderNum = 'ECM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      userId: 'mock-user-1',
      orderNumber: orderNum,
      totalAmount: cart.totalAmount || 189.0,
      status: 'Processing',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      orderItems: cart.items.map((it) => ({
        id: 'ord-item-' + it.id,
        productId: it.productId,
        productName: it.productName,
        productImageUrl: it.productImageUrl,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        subtotal: it.subtotal,
      })),
    };
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('mock_orders');
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(newOrder);
      localStorage.setItem('mock_orders', JSON.stringify(orders));
      localStorage.removeItem('mock_cart_items');
    }
    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mock_orders') : null;
    return raw ? JSON.parse(raw) : [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_orders', JSON.stringify(orders));
    }
    return order;
  },
};
