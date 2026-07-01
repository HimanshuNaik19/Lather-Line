import { useState } from 'react';
import { useAllCoupons, useCreateCoupon, useDeactivateCoupon, useAllPlans, useCreatePlan } from '@/hooks/useMarketing';
import { Tag, Zap, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<'coupons' | 'plans'>('coupons');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-3xl">Marketing & Subscriptions</h1>
      </div>

      <div className="flex gap-4 border-b border-surface-border">
        <button
          onClick={() => setTab('coupons')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            tab === 'coupons' ? 'border-brand-400 text-brand-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Tag size={16} className="inline mr-2" />
          Coupons
        </button>
        <button
          onClick={() => setTab('plans')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            tab === 'plans' ? 'border-brand-400 text-brand-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={16} className="inline mr-2" />
          Subscriptions
        </button>
      </div>

      {tab === 'coupons' && <CouponsTab />}
      {tab === 'plans' && <PlansTab />}
    </div>
  );
}

function CouponsTab() {
  const { data: coupons, isLoading } = useAllCoupons();
  const createCoupon = useCreateCoupon();
  const deactivateCoupon = useDeactivateCoupon();

  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');

  const handleCreate = () => {
    if (!code || !discountPercentage) return;
    createCoupon.mutate({
      code: code.toUpperCase(),
      discountPercentage: Number(discountPercentage),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      isActive: true,
    }, {
      onSuccess: () => {
        setCode('');
        setDiscountPercentage('');
        setMaxDiscount('');
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-400" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-border/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Max Discount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {coupons?.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-surface-border/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-300">{coupon.code}</td>
                    <td className="px-6 py-4">{coupon.discountPercentage}%</td>
                    <td className="px-6 py-4">{coupon.maxDiscount ? `₹${coupon.maxDiscount}` : 'None'}</td>
                    <td className="px-6 py-4">
                      {coupon.isActive ? (
                        <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400"><XCircle size={14} /> Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {coupon.isActive && (
                        <button
                          onClick={() => deactivateCoupon.mutate(coupon.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!coupons?.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">No coupons found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 h-fit space-y-4">
        <h3 className="font-semibold text-lg">Create Coupon</h3>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Code</label>
          <input className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm uppercase focus:border-brand-500 outline-none" 
            value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SUMMER20" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Discount Percentage (%)</label>
          <input type="number" className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
            value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} placeholder="20" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Max Discount (₹, Optional)</label>
          <input type="number" className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
            value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="100" />
        </div>
        <button
          onClick={handleCreate}
          disabled={!code || !discountPercentage || createCoupon.isPending}
          className="w-full py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 mt-2"
        >
          {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
        </button>
      </div>
    </div>
  );
}

function PlansTab() {
  const { data: plans, isLoading } = useAllPlans();
  const createPlan = useCreatePlan();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [kg, setKg] = useState('');
  const [pcs, setPcs] = useState('');

  const handleCreate = () => {
    if (!name || !price) return;
    createPlan.mutate({
      name,
      price: Number(price),
      includedKg: Number(kg || 0),
      includedPieces: Number(pcs || 0),
      isActive: true,
    }, {
      onSuccess: () => {
        setName('');
        setPrice('');
        setKg('');
        setPcs('');
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-400" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-border/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Price/mo</th>
                  <th className="px-6 py-4 font-medium">Included KG</th>
                  <th className="px-6 py-4 font-medium">Included Pcs</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {plans?.map(plan => (
                  <tr key={plan.id} className="hover:bg-surface-border/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-300">{plan.name}</td>
                    <td className="px-6 py-4">₹{plan.price}</td>
                    <td className="px-6 py-4">{plan.includedKg}</td>
                    <td className="px-6 py-4">{plan.includedPieces}</td>
                    <td className="px-6 py-4">
                      {plan.isActive ? (
                        <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded-full">Active</span>
                      ) : (
                        <span className="text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded-full">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!plans?.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">No subscription plans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 h-fit space-y-4">
        <h3 className="font-semibold text-lg">Create Plan</h3>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Plan Name</label>
          <input className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
            value={name} onChange={e => setName(e.target.value)} placeholder="Gold Plan" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Monthly Price (₹)</label>
          <input type="number" className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
            value={price} onChange={e => setPrice(e.target.value)} placeholder="2000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Included KG</label>
            <input type="number" className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
              value={kg} onChange={e => setKg(e.target.value)} placeholder="30" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Included Pcs</label>
            <input type="number" className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none" 
              value={pcs} onChange={e => setPcs(e.target.value)} placeholder="10" />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={!name || !price || createPlan.isPending}
          className="w-full py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 mt-2"
        >
          {createPlan.isPending ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </div>
  );
}
