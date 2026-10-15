import React from 'react';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import type { Order } from '../types';

interface OrdersTabProps {
  orders: Order[];
  onExplore: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onExplore }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 border border-white/5">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <section id="orders" className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 pb-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block mb-1">
            Order Fulfillment History
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Customer Orders & Receipts
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">{orders.length} Total Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center rounded-2xl border border-white/5 bg-zinc-900/40">
          <Package className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300 mb-1">No orders placed yet</h3>
          <p className="text-xs text-zinc-500 mb-6">Explore the hardware catalog to submit your first purchase.</p>
          <button
            onClick={onExplore}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6 transition-all hover:border-white/20 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono text-emerald-400 select-all">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-zinc-500 block">Total Amount</span>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Line Items */}
              <div className="pt-4 space-y-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Line Items ({order.orderItems?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-950/40 p-2.5"
                    >
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName || 'Product'}
                          className="h-10 w-10 rounded-md object-cover bg-zinc-900 border border-white/5 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 text-zinc-500">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-white truncate block">
                          {item.productName || 'Catalog Item'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 block">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address details */}
              {order.shippingAddress && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex flex-wrap gap-x-4">
                  <span>Ship to: <strong className="text-zinc-300 font-medium">{order.shippingAddress.fullName}</strong></span>
                  <span>{order.shippingAddress.streetAddress}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
