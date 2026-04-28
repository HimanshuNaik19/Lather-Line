import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { Package, Plus, Clock, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatOrderRef } from '@/utils/orderRef';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useMyOrders();

  const recentOrders = orders?.slice(0, 3) ?? [];
  const totalOrders = orders?.length ?? 0;
  const delivered = orders?.filter((order) => order.orderStatus === 'DELIVERED').length ?? 0;
  const inProgress = orders?.filter((order) =>
    ['PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY'].includes(order.orderStatus)
  ).length ?? 0;

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-3xl">
              Good day, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-gray-400 mt-1">Here&apos;s your laundry overview</p>
          </div>
          <Link
            to="/orders/new"
            id="new-order-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-105 transition-all"
          >
            <Plus size={18} /> New Order
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-brand-400' },
            { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-yellow-400' },
            { label: 'Delivered', value: delivered, icon: CheckCircle2, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-card-gradient border border-surface-border rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-500/40 transition-colors"
            >
              <Icon size={20} className={color} />
              <div>
                <p className="font-display font-bold text-3xl text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card-gradient border border-surface-border rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-400" /> Recent Orders
            </h2>
            <Link to="/orders" className="text-sm text-brand-400 hover:underline">View all</Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-brand-400" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No orders yet.</p>
              <Link to="/orders/new" className="text-brand-400 text-sm hover:underline mt-1 inline-block">
                Create your first order
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.publicId}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-surface-input border border-surface-border hover:border-brand-500/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      Order #{formatOrderRef(order.publicId)} | {order.serviceTypeName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pickup: {format(new Date(order.pickupTime), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <StatusBadge status={order.orderStatus} />
                    <p className="text-brand-400 font-semibold text-sm">Rs {order.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
