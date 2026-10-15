import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { OrdersTab } from './components/OrdersTab';
import { AdminTab } from './components/AdminTab';
import { Toast } from './components/Toast';
import { useAuthStore } from './stores/useAuthStore';
import { useCartStore } from './stores/useCartStore';
import { api, SEED_CATEGORIES, SEED_PRODUCTS } from './services/api';
import type { Category, Order, Product } from './types';

export interface AppProps {
  title?: string;
}

export const App: React.FC<AppProps> = ({ title = 'check-app-frontend' }) => {
  const { initAuth } = useAuthStore();
  const { closeCart, fetchCart } = useCartStore();

  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'orders' | 'admin'>('home');
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      // Retain seed data
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const userOrders = await api.getOrders();
      setOrders(userOrders);
    } catch {
      // Ignored if unauthenticated
    }
  }, []);

  useEffect(() => {
    initAuth();
    loadData();
    fetchCart();
    loadOrders();
  }, [initAuth, loadData, fetchCart, loadOrders]);

  // Handle hash changes if clicked directly
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'shop' || hash === 'orders' || hash === 'admin' || hash === 'home') {
        setActiveTab(hash as 'home' | 'shop' | 'orders' | 'admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setActiveTab('shop');
    // Scroll smoothly to shop section if on home
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.orderNumber} confirmed!`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Universal Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brandTitle={title}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <>
            <Hero
              onExplore={() => setActiveTab('shop')}
              onSelectCategory={handleSelectCategory}
              categories={categories}
            />
            {/* Embedded Catalog Showcase */}
            <Catalog
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onShowToast={showToast}
            />
          </>
        )}

        {activeTab === 'shop' && (
          <Catalog
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onExplore={() => setActiveTab('shop')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            products={products}
            orders={orders}
            onRefreshProducts={loadData}
            onRefreshOrders={loadOrders}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Slide-Over Cart Drawer */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
        onViewOrders={() => setActiveTab('orders')}
      />

      {/* Customer & Admin Authentication Modal */}
      <AuthModal />

      {/* Toast Alert Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Luxury Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 py-12 text-zinc-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-bold text-white tracking-tight">e-commerce-mock</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="font-mono text-zinc-400">{title}</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span>Enterprise E-Commerce Reference System</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              AlphaCI Production Ready
            </span>
            <span>PostgreSQL Relational DB</span>
            <span>JWT Bearer Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};