import { useState } from 'react';
import { ChevronLeft, ChevronRight, IndianRupee, Loader2, Package, Users } from 'lucide-react';
import { useAllOrdersPage } from '@/hooks/useOrders';

const PAGE_SIZE = 5;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useAllOrdersPage(page, PAGE_SIZE);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="text-brand-500 animate-spin" /></div>;
  }

  const orders = data?.content ?? [];
  const totalOrders = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.number ?? 0;
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const pendingCount = orders.filter((order) => order.orderStatus === 'PENDING').length;
  const inProgressCount = orders.filter((order) => order.orderStatus === 'IN_PROGRESS' || order.orderStatus === 'PICKED_UP').length;
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Store Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your laundry operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visible Revenue', value: `Rs ${totalRevenue.toFixed(2)}`, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending on Page', value: pendingCount, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'In Progress on Page', value: inProgressCount, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col justify-between hover:border-surface-border/80 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-display font-bold text-white">{stat.value}</p>
                </div>
                <div className={classNames('p-3 rounded-xl border border-white/5', stat.bg)}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-8 bg-surface-dark border border-surface-border rounded-2xl overflow-hidden transition-opacity ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
        <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Store Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Page {currentPage + 1} of {totalPages}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={!hasPrev || isFetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border text-sm text-gray-300 hover:border-brand-500/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
              disabled={!hasNext || isFetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border text-sm text-gray-300 hover:border-brand-500/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-surface-border">
          {orders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">No orders placed yet.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    Order #{order.id}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {order.serviceTypeName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-400">Rs {order.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.orderStatus}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
