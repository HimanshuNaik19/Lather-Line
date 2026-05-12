import { useState, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
import { useCreatePosOrder } from '@/hooks/useOrders';
import type { ServiceType, OrderItemRequest } from '@/types';
import { Search, Plus, Minus, Trash2, Scale, Package, CheckCircle2 } from 'lucide-react';

interface CartItem { service: ServiceType; quantity: number; label: string; }

export default function POSPage() {
  const { data: services } = useServices();
  const createPosOrder = useCreatePosOrder();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.service.pricePerUnit * i.quantity, 0),
    [cart]
  );

  const filteredServices = useMemo(
    () => (services ?? []).filter(s => s.active && s.name.toLowerCase().includes(serviceSearch.toLowerCase())),
    [services, serviceSearch]
  );

  const addToCart = (service: ServiceType) => {
    setCart(prev => {
      const exists = prev.find(i => i.service.id === service.id);
      if (exists) return prev.map(i => i.service.id === service.id
        ? { ...i, quantity: i.service.unit === 'KG' ? +(i.quantity + 0.5).toFixed(1) : i.quantity + 1 }
        : i);
      return [...prev, { service, quantity: 1, label: '' }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.service.id !== id) return i;
      const step = i.service.unit === 'KG' ? 0.5 : 1;
      const n = +(i.quantity + delta * step).toFixed(1);
      return n <= 0 ? i : { ...i, quantity: n };
    }));
  };

  const setLabel = (id: number, label: string) =>
    setCart(prev => prev.map(i => i.service.id === id ? { ...i, label } : i));
  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.service.id !== id));

  const handleSubmit = () => {
    setError('');
    if (!phone || !name) { setError('Customer phone and name are required.'); return; }
    if (cart.length === 0) { setError('Add at least one service to the order.'); return; }

    const items: OrderItemRequest[] = cart.map(i => ({
      serviceTypeId: i.service.id,
      quantity: i.quantity,
      label: i.label || undefined,
    }));

    createPosOrder.mutate(
      { customerPhone: phone, customerName: name, items, specialInstructions: notes },
      {
        onSuccess: () => {
          setSuccess(true);
          setPhone(''); setName(''); setCart([]); setNotes('');
          setTimeout(() => setSuccess(false), 4000);
        },
        onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to create order.'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Walk-In POS</h1>
        <p className="text-gray-400 text-sm mt-1">Rapid order entry for walk-in customers.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
          <CheckCircle2 size={18} /> Order created successfully!
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Customer + Services */}
        <div className="lg:col-span-3 space-y-5">
          {/* Customer info */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Phone Number *</label>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Customer Name *</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Service search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Search services…"
              value={serviceSearch}
              onChange={e => setServiceSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-card border border-surface-border text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Service grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredServices.map(service => {
              const inCart = cart.find(i => i.service.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => addToCart(service)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    inCart ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-card hover:border-brand-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {service.unit === 'KG'
                        ? <Scale size={15} className="text-blue-400" />
                        : <Package size={15} className="text-purple-400" />}
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${service.unit === 'KG' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {service.unit === 'KG' ? '/kg' : '/pc'}
                    </span>
                  </div>
                  <p className="text-brand-400 font-bold text-sm">₹{service.pricePerUnit}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Cart */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-base">Order Items</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No items added yet.</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.service.id} className="p-3 rounded-xl bg-surface-input border border-surface-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.service.name}</span>
                      <button onClick={() => removeItem(item.service.id)} className="text-red-500/70 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.service.id, -1)} className="w-7 h-7 rounded-lg bg-surface-border flex items-center justify-center">
                        <Minus size={12} />
                      </button>
                      <span className="w-14 text-center text-sm font-medium">
                        {item.quantity}{item.service.unit === 'KG' ? 'kg' : 'pc'}
                      </span>
                      <button onClick={() => updateQty(item.service.id, 1)} className="w-7 h-7 rounded-lg bg-surface-border flex items-center justify-center">
                        <Plus size={12} />
                      </button>
                      <span className="ml-auto text-brand-400 text-sm font-semibold">
                        ₹{(item.service.pricePerUnit * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.service.unit === 'PIECE' && (
                      <input
                        type="text"
                        placeholder="Label (optional)…"
                        value={item.label}
                        onChange={e => setLabel(item.service.id, e.target.value)}
                        className="mt-2 w-full text-xs bg-surface-border rounded-lg px-3 py-1.5 text-gray-400 placeholder-gray-600 focus:outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-3 border-t border-surface-border flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-brand-400 font-bold text-xl">₹{total.toFixed(2)}</span>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Notes (optional)</label>
                  <textarea
                    rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Handle with care…"
                    className="w-full bg-surface-input border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={createPosOrder.isPending}
                  className="w-full py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 hover:shadow-glow-brand transition-all"
                >
                  {createPosOrder.isPending ? 'Creating…' : `Create Order · ₹${total.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
