import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateItemQuantity,
    removeItem,
    subtotal,
    estimatedTax,
    shippingFee,
    totalAmount,
  } = useCartStore();

  if (!isOpen) return null;

  const freeShippingTarget = 150.0;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingTarget) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingTarget - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          data-testid="cart-drawer"
          
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          className="w-screen max-w-md bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 id="cart-drawer-title" className="text-lg font-bold text-white tracking-tight">
                Your Shopping Cart
              </h2>
              <span className="text-xs font-mono text-zinc-400">({items.length})</span>
            </div>

            <button
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-zinc-950/60 border-b border-white/5">
            <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <span className="font-mono font-bold text-emerald-400">${remainingForFreeShipping.toFixed(2)}</span> for Free Shipping
                  </>
                ) : (
                  <span className="font-semibold text-emerald-400">Unlocked Free Premium Shipping!</span>
                )}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">{progressToFreeShipping.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Line Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-24 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                <p className="text-base font-semibold text-zinc-300 mb-1">Your cart is empty</p>
                <p className="text-xs text-zinc-500 mb-6">Discover our engineered catalog items to fill your basket.</p>
                <button
                  onClick={closeCart}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-950/50 p-3.5 transition-colors hover:border-white/10"
                >
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="h-16 w-16 rounded-lg object-cover bg-zinc-900 border border-white/5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate mb-1">
                      {item.productName}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 tabular-nums">
                      ${item.unitPrice.toFixed(2)} each
                    </p>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.productName}`}
                          className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.productName}`}
                          className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.productName} from cart`}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action (Respects Mobile Safe Areas) */}
          {items.length > 0 && (
            <div className="border-t border-white/10 bg-zinc-950/80 px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="space-y-2 text-xs text-zinc-400 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200 tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8.5%)</span>
                  <span className="font-mono text-zinc-200 tabular-nums">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-zinc-200 tabular-nums">
                    <span>{`${shippingFee.toFixed(2)}`}</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="font-mono text-emerald-400 tabular-nums text-base">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] shadow-xl shadow-emerald-500/25 min-h-[44px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
