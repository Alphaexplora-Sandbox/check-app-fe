import { create } from 'zustand';
import type { CartItem, Product } from '../types';
import { api } from '../services/api';

const TAX_RATE = 0.085;
const FREE_SHIPPING_THRESHOLD = 150.0;
const SHIPPING_FEE = 15.0;

interface CartState {
  items: CartItem[];
  subtotal: number;
  estimatedTax: number;
  shippingFee: number;
  totalAmount: number;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const estimatedTax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const totalAmount = Math.round((subtotal + estimatedTax + shippingFee) * 100) / 100;
  return { subtotal, estimatedTax, shippingFee, totalAmount };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  estimatedTax: 0,
  shippingFee: 0,
  totalAmount: 0,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    if (!token) return;

    try {
      set({ isLoading: true });
      const data = await api.getCart();
      set({
        items: data.items,
        subtotal: data.subtotal,
        estimatedTax: data.estimatedTax,
        shippingFee: data.shippingFee,
        totalAmount: data.totalAmount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    if (token) {
      try {
        const data = await api.addToCart(product.id, quantity);
        set({
          items: data.items,
          subtotal: data.subtotal,
          estimatedTax: data.estimatedTax,
          shippingFee: data.shippingFee,
          totalAmount: data.totalAmount,
          isOpen: true,
        });
        return;
      } catch {
        // Fallback to local state if backend call fails
      }
    }

    const currentItems = [...get().items];
    const existingIndex = currentItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      const newQty = existing.quantity + quantity;
      currentItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: existing.unitPrice * newQty,
      };
    } else {
      currentItems.push({
        id: 'cart-item-' + Date.now() + '-' + Date.now().toString(36).substring(2, 7),
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

    const totals = calculateTotals(currentItems);
    set({ items: currentItems, ...totals, isOpen: true });
  },

  updateItemQuantity: async (id, quantity) => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    if (token) {
      try {
        const data = await api.updateCartItem(id, quantity);
        set({
          items: data.items,
          subtotal: data.subtotal,
          estimatedTax: data.estimatedTax,
          shippingFee: data.shippingFee,
          totalAmount: data.totalAmount,
        });
        return;
      } catch {
        // Fallback
      }
    }

    let currentItems = [...get().items];
    if (quantity <= 0) {
      currentItems = currentItems.filter((item) => item.id !== id);
    } else {
      currentItems = currentItems.map((item) =>
        item.id === id ? { ...item, quantity, subtotal: item.unitPrice * quantity } : item,
      );
    }
    const totals = calculateTotals(currentItems);
    set({ items: currentItems, ...totals });
  },

  removeItem: async (id) => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    if (token) {
      try {
        const data = await api.removeCartItem(id);
        set({
          items: data.items,
          subtotal: data.subtotal,
          estimatedTax: data.estimatedTax,
          shippingFee: data.shippingFee,
          totalAmount: data.totalAmount,
        });
        return;
      } catch {
        // Fallback
      }
    }

    const currentItems = get().items.filter((item) => item.id !== id);
    const totals = calculateTotals(currentItems);
    set({ items: currentItems, ...totals });
  },

  clearCart: async () => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    if (token) {
      try {
        await api.clearCart();
      } catch {
        // Fallback
      }
    }
    set({
      items: [],
      subtotal: 0,
      estimatedTax: 0,
      shippingFee: 0,
      totalAmount: 0,
    });
  },
}));
