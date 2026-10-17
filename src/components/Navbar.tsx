import React from 'react';
import { ShoppingBag, User as UserIcon, LogOut, ShieldCheck, Layers } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';

interface NavbarProps {
  activeTab: 'home' | 'shop' | 'orders' | 'admin';
  setActiveTab: (tab: 'home' | 'shop' | 'orders' | 'admin') => void;
  brandTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, brandTitle = 'check-app-frontend' }) => {
  const { user, openAuthModal, logout } = useAuthStore();
  const { items, openCart } = useCartStore();

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left text-white transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">e-commerce-mock</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block leading-none font-mono">
                {brandTitle}
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <a
              href="#shop"
              
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('shop');
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'shop'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              Shop Catalog
            </a>
            <a
              href="#orders"
              
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('orders');
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              Orders
            </a>
            {(user != null && user.role === 'Admin') && (
              <a
                href="#admin"
                
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('admin');
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Inventory
              </a>
            )}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            data-testid="cart-trigger"
            className="relative flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-emerald-500/40 hover:bg-zinc-850"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/20 px-1.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/30">
              {totalItemCount}
            </span>
          </button>

          {/* User Authentication state */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white leading-tight">{user.fullName}</span>
                <span className="text-[10px] text-zinc-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={logout}
                aria-label="Sign out of account"
                title="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400 hover:bg-zinc-850"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-white/5 bg-zinc-900/60 px-4 py-2 justify-around">
        <a
          href="#shop"
          
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('shop');
          }}
          className={`text-xs font-medium py-1 px-2.5 rounded ${
            activeTab === 'shop' ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'
          }`}
        >
          Shop Catalog
        </a>
        <a
          href="#orders"
          
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('orders');
          }}
          className={`text-xs font-medium py-1 px-2.5 rounded ${
            activeTab === 'orders' ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'
          }`}
        >
          Orders
        </a>
        {(user != null && user.role === 'Admin') && (
          <a
            href="#admin"
            
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('admin');
            }}
            className={`text-xs font-medium py-1 px-2.5 rounded ${
              activeTab === 'admin' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
            }`}
          >
            Admin Inventory
          </a>
        )}
      </div>
    </header>
  );
};
