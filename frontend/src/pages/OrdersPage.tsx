import { Link } from 'react-router-dom';
import { useMyOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { Package, Plus, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useMyOrders();

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">My Orders</h1>
            <p className="text-gray-400 mt-1 text-sm">Track all your laundry orders</p>
          </div>
          <Link
            to="/orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-105 transition-all"
          >
            <Plus size={18} /> New Order
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-brand-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-400">
            Failed to load orders. Please refresh.
          </div>
        )}

        {!isLoading && orders?.length === 0 && (
          <div className="text-center py-24">
            <Package size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-gray-300 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Schedule your first pickup to get started.</p>
            <Link
              to="/orders/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand transition-all"
            >
              Schedule Pickup <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            {orders.map((order) => (
              <div
                key={order.id}
                className="group bg-card-gradient border border-surface-border rounded-2xl p-5 hover:border-brand-500/50 hover:shadow-glow-brand transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Service icon area */}
                  <div className="w-11 h-11 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-brand-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-white">Order #{order.id}</p>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <p className="text-sm text-gray-300">{order.serviceTypeName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {order.addressCity} · Pickup: {format(new Date(order.pickupTime), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>

                  {/* Amount + CTA */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-brand-400 font-bold text-lg">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-500">
                      Placed {format(new Date(order.createdAt), 'dd MMM')}
                    </p>
                  </div>
                </div>

                {order.specialInstructions && (
                  <p className="mt-3 pt-3 border-t border-surface-border text-xs text-gray-400">
                    📝 {order.specialInstructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
