import React, { useState } from 'react';
import { ShieldCheck, Save, RefreshCw, AlertTriangle, XCircle, CheckCircle, Truck, Package } from 'lucide-react';
import type { Product, Order } from '../types';
import { api } from '../services/api';

interface AdminTabProps {
  products: Product[];
  orders: Order[];
  onRefreshProducts: () => Promise<void>;
  onRefreshOrders: () => Promise<void>;
  onShowToast: (message: string) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  products,
  orders,
  onRefreshProducts,
  onRefreshOrders,
  onShowToast,
}) => {
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  const [isUpdatingStock, setIsUpdatingStock] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  const handleStockChange = (productId: string, val: number) => {
    setStockValues((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = stockValues[product.id] ?? product.stockQuantity;
    setIsUpdatingStock(product.id);
    try {
      await api.updateStock(product.id, newStock);
      await onRefreshProducts();
      onShowToast(`Updated stock for ${product.name} to ${newStock}`);
    } catch {
      onShowToast(`Failed to update stock for ${product.name}`);
    } finally {
      setIsUpdatingStock(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingOrder(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await onRefreshOrders();
      onShowToast(`Order status updated to ${newStatus}`);
    } catch {
      onShowToast('Failed to update order status');
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  return (
    <section id="admin" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Operator Console</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Inventory & Fulfillment Control
          </h2>
        </div>

        <button
          onClick={async () => {
            await onRefreshProducts();
            await onRefreshOrders();
            onShowToast('Refreshed inventory and orders');
          }}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Section 1: Product Inventory Table */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Catalog Stock Management</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">{products.length} Products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-4 sm:px-6">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">In-Stock Qty</th>
                <th className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {products.map((p) => {
                const currentVal = stockValues[p.id] ?? p.stockQuantity;
                const isChanged = currentVal !== p.stockQuantity;
                const isLow = p.stockQuantity > 0 && p.stockQuantity <= 10;
                const isZero = p.stockQuantity === 0;

                return (
                  <tr key={p.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover bg-zinc-950 border border-white/5 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate block">{p.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{p.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{p.categoryName || 'General'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">${p.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400">
                          <XCircle className="h-3.5 w-3.5" /> Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" /> Available
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="0"
                        aria-label={`Stock quantity for ${p.name}`}
                        value={currentVal}
                        onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                        className="w-20 rounded-md border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleSaveStock(p)}
                        disabled={!isChanged || isUpdatingStock === p.id}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          isChanged
                            ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isUpdatingStock === p.id ? 'Saving...' : 'Save'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Order Fulfillment Management */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Order Status & Fulfillment Pipeline</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">{orders.length} Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-4 sm:px-6">Order Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Promote Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No active orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-400 select-all">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">
                      ${o.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                      {o.status === 'Processing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                          disabled={isUpdatingOrder === o.id}
                          className="rounded-md bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {o.status === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                          disabled={isUpdatingOrder === o.id}
                          className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
