import { useAvailableDeliveries, useClaimDelivery } from '@/hooks/useDeliveries';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { formatOrderRef } from '@/utils/orderRef';
import { Loader2, Package, MapPin, Plus } from 'lucide-react';


export default function DriverAvailablePage() {
  const { data: deliveries, isLoading, error } = useAvailableDeliveries();
  const claimDelivery = useClaimDelivery();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={36} /></div>;
  }

  if (error) {
    return <div className="p-6 rounded-xl border border-red-500/40 text-red-400">Failed to load available deliveries.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Available Pickups</h1>
        <p className="text-gray-400 mt-1">Claim orders that are ready for delivery.</p>
      </div>

      {!deliveries || deliveries.length === 0 ? (
        <div className="bg-surface-dark border border-surface-border rounded-xl p-12 text-center">
          <Package className="mx-auto text-gray-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No orders available</h2>
          <p className="text-gray-500">All ready orders have been assigned or delivered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deliveries.map((order) => (
            <div key={order.publicId} className="bg-surface-dark border border-surface-border rounded-2xl p-5 hover:border-cyan-500/30 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">#{formatOrderRef(order.publicId)}</p>
                  <h3 className="font-bold">{order.customerName}</h3>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="flex items-start gap-2 text-gray-400 text-sm mb-4 flex-1">
                <MapPin className="shrink-0 mt-0.5" size={16} />
                <p>{order.addressCity}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border">
                <PaymentBadge status={order.paymentStatus} />
                <button
                  onClick={() => claimDelivery.mutate(order.publicId)}
                  disabled={claimDelivery.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold transition-colors disabled:opacity-50"
                >
                  {claimDelivery.isPending && claimDelivery.variables === order.publicId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
