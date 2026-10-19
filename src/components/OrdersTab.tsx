import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag, XCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import type { Order, OrderTracking } from '../types';

interface OrdersTabProps {
  orders: Order[];
  onExplore: () => void;
  onOrderUpdated?: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onExplore, onOrderUpdated }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [trackingMap, setTrackingMap] = useState<Record<string, OrderTracking>>({});
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Changed my mind');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

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
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" />
            Cancelled � Refunded
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

  const handleToggleTrack = async (orderId: string) => {
    if (expandedTrackId === orderId) {
      setExpandedTrackId(null);
      return;
    }
    setExpandedTrackId(orderId);
    if (!trackingMap[orderId]) {
      try {
        const tracking = await api.trackOrder(orderId);
        setTrackingMap((prev) => ({ ...prev, [orderId]: tracking }));
      } catch {
        // Handled in api.ts
      }
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      const updated = await api.cancelOrder(cancelModalOrder.id, cancelReason);
      setCancelNotice('Order ' + cancelModalOrder.orderNumber + ' cancelled. Inventory stock restored and refund issued.');
      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
      setCancelModalOrder(null);
      const refreshedTracking = await api.trackOrder(cancelModalOrder.id);
      setTrackingMap((prev) => ({ ...prev, [cancelModalOrder.id]: refreshedTracking }));
    } catch {
      setCancelNotice('Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped';
    if (filter === 'delivered') return o.status === 'Delivered';
    if (filter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  return (
    <section id="orders" className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
              Version 3 Milestone
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400">
              Order Fulfillment History
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Customer Orders & Receipts
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-900 p-1 border border-white/10 self-start sm:self-auto">
          {(['all', 'active', 'delivered', 'cancelled'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={
                'px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ' +
                (filter === tabKey
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white')
              }
            >
              {tabKey}
            </button>
          ))}
        </div>
      </div>

      {cancelNotice && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{cancelNotice}</span>
          </div>
          <button
            onClick={() => setCancelNotice(null)}
            className="text-zinc-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="py-24 text-center rounded-2xl border border-white/5 bg-zinc-900/40">
          <Package className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300 mb-1">No orders placed yet</h3>
          <p className="text-xs text-zinc-500 mb-6">
            {filter === 'all'
              ? 'Explore the hardware catalog to submit your first purchase.'
              : 'No orders matching filter "' + filter + '".'}
          </p>
          <button
            onClick={onExplore}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCancellable = order.status === 'Pending' || order.status === 'Processing';
            const isExpanded = expandedTrackId === order.id;
            const tracking = trackingMap[order.id];

            return (
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

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="text-xs text-zinc-500">Total Amount</span>
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      {'$' + order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Line Items Grid */}
                <div className="pt-4 space-y-3">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Line Items ({order.orderItems ? order.orderItems.length : 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-950/40 p-2.5"
                      >
                        {Boolean(item.productImageUrl) ? (
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
                            {item.productName}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            Qty: {item.quantity} x {'$' + item.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white tabular-nums">
                          {'$' + item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Milestone Timeline */}
                {isExpanded && tracking && (
                  <div className="mt-4 pt-4 border-t border-white/5 bg-zinc-950/50 rounded-xl p-4">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-3">
                      Live Delivery Milestones
                    </span>
                    <div className="space-y-4">
                      {tracking.milestones.map((m, idx) => (
                        <div key={idx} className="flex items-start gap-3 relative">
                          <div
                            className={
                              'flex h-6 w-6 rounded-full items-center justify-center text-xs font-bold shrink-0 ' +
                              (m.completed
                                ? m.title.includes('Cancelled')
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-emerald-500 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-500 border border-white/10')
                            }
                          >
                            {m.completed ? "*" : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={'text-xs font-semibold ' + (m.current ? 'text-emerald-400' : 'text-white')}>
                                {m.title}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleTrack(order.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>{isExpanded ? 'Hide Milestone Timeline' : 'Track Milestone Timeline'}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {isCancellable && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Cancel & Refund Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Order & Refund</h3>
                <span className="text-xs font-mono text-zinc-400">{cancelModalOrder.orderNumber}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4">
              Cancelling will immediately return <strong>{'$' + cancelModalOrder.totalAmount.toFixed(2)}</strong> to your payment card and restore inventory quantities to the catalog.
            </p>

            <div className="mb-6">
              <label htmlFor="cancel-reason-select" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Reason for cancellation
              </label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found alternative hardware">Found alternative hardware</option>
                <option value="Need different shipping destination">Need different shipping destination</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={isCancelling}
                className="rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
