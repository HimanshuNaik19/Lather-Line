import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Clock3, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useOrder } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { formatOrderRef } from '@/utils/orderRef';

const flow = ['PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'DELIVERED'] as const;

export default function AdminOrderDetailsPage() {
  const { publicId = '' } = useParams();
  const { data: order, isLoading } = useOrder(publicId);
  const [isPrintingTag, setIsPrintingTag] = useState(false);

  useEffect(() => {
    if (isPrintingTag) {
      setTimeout(() => {
        window.print();
        setIsPrintingTag(false);
      }, 100);
    }
  }, [isPrintingTag]);

  const activeIndex = useMemo(
    () => flow.indexOf((order?.orderStatus as typeof flow[number]) ?? 'PENDING'),
    [order?.orderStatus]
  );

  if (isLoading || !order) {
    return <div className="text-white">Loading order...</div>;
  }

  return (
    <>
    {isPrintingTag && (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8 text-black print-only-view">
        <h1 className="text-3xl font-bold mb-2">Lather & Line</h1>
        <p className="text-xl mb-8">Order #{formatOrderRef(order.publicId)}</p>
        <QRCodeSVG 
          value={`${window.location.origin}/scan/${order.publicId}`} 
          size={256} 
          level="H" 
          includeMargin 
        />
        <p className="mt-8 text-lg font-medium">{order.addressCity}</p>
        <p className="text-md text-gray-600 mt-2">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items total</p>
      </div>
    )}
    
    <div className={`max-w-7xl mx-auto text-white space-y-6 ${isPrintingTag ? 'hidden' : ''}`}>
      <div>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xl mb-2">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-display">Order #{formatOrderRef(order.publicId)}</h1>
          <StatusBadge status={order.orderStatus} />
        </div>
        <p className="text-gray-400 text-sm mt-1">Created {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</p>
      </div>

      <div className="bg-surface-dark border border-brand-500/40 rounded-2xl p-6">
        <div className="flex justify-between items-center gap-2">
          {flow.map((step, index) => (
            <div key={step} className="flex-1 text-center">
              <div className={`mx-auto w-10 h-10 rounded-full border-2 flex items-center justify-center ${index <= activeIndex ? 'border-brand-400 bg-brand-500/20 text-brand-300' : 'border-surface-border text-gray-500'}`}>
                OK
              </div>
              <p className={`mt-2 text-sm font-semibold ${index <= activeIndex ? 'text-brand-300' : 'text-gray-400'}`}>
                {step.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Reference</p>
                <p className="font-semibold break-all">{order.publicId}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-semibold inline-flex items-center gap-2"><Phone size={16} /> N/A</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400">Address</p>
                <p className="font-semibold inline-flex items-center gap-2"><MapPin size={16} /> {order.addressCity}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-surface-border">
                  <th className="pb-2">Service</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5">
                      <p className="font-medium">{item.serviceName}</p>
                      {item.label && <p className="text-gray-500 text-xs">{item.label}</p>}
                    </td>
                    <td className="py-2.5 text-gray-300">{item.quantity}{item.unit === 'KG' ? ' kg' : ' pcs'}</td>
                    <td className="py-2.5 text-gray-300">₹{item.unitPrice}</td>
                    <td className="py-2.5 text-brand-400 font-semibold text-right">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-surface-border">
                  <td colSpan={3} className="pt-3 font-bold">Total</td>
                  <td className="pt-3 text-brand-400 font-bold text-right text-base">₹{order.totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-surface-border text-sm text-gray-400">
              <Clock3 size={14} /> Pickup: {format(new Date(order.pickupTime), 'dd MMM yyyy, HH:mm')}
            </div>

            {order.specialInstructions && (
              <div className="mt-3 p-4 rounded-lg bg-surface-input text-sm text-gray-300">
                {order.specialInstructions}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>Rs {order.totalAmount}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tax</span><span>Rs 0</span></div>
              <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-brand-400">Rs {order.totalAmount}</span></div>
            </div>
          </div>

          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 space-y-3 no-print">
            <h2 className="font-semibold text-base">Quick Actions</h2>
            <button onClick={() => window.print()} className="w-full py-3 rounded-lg border border-surface-border hover:bg-surface-border transition-colors text-sm font-semibold">Print Receipt</button>
            <button onClick={() => setIsPrintingTag(true)} className="w-full py-3 rounded-lg bg-brand-gradient text-white hover:shadow-glow-brand transition-all text-sm font-semibold">Print QR Bag Tag</button>
            <button className="w-full py-3 rounded-lg border border-surface-border text-sm font-semibold">Send WhatsApp Reminder</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
