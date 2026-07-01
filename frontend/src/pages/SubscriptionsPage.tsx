import { useActivePlans, useSubscribe, useMySubscription } from '@/hooks/useMarketing';
import { CheckCircle, Zap, Package, Loader2 } from 'lucide-react';

export default function SubscriptionsPage() {
  const { data: plans, isLoading: plansLoading } = useActivePlans();
  const { data: currentSub, isLoading: subLoading } = useMySubscription();
  const subscribe = useSubscribe();

  if (plansLoading || subLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-400" size={36} /></div>;
  }

  return (
    <div className="min-h-screen bg-surface text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-display font-bold text-4xl">Laundry Subscriptions</h1>
          <p className="text-gray-400 text-lg">Save money and never worry about running out of clean clothes. Subscribe to a monthly plan today.</p>
        </div>

        {currentSub && (
          <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-brand-400 mb-2">You have an active subscription</h2>
            <p className="text-gray-300">You are currently subscribed to the <span className="font-semibold text-white">{currentSub.plan.name}</span> plan.</p>
            <p className="text-sm text-gray-500 mt-2">Manage your subscription in your Account settings.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans?.map(plan => (
            <div key={plan.id} className="bg-surface-dark border border-surface-border hover:border-brand-500/50 rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-brand/20 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -z-10" />
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-display font-bold">₹{plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.includedKg > 0 && (
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="text-brand-400 shrink-0" size={20} />
                    <span>Up to <strong>{plan.includedKg} kg</strong> of laundry</span>
                  </li>
                )}
                {plan.includedPieces > 0 && (
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="text-brand-400 shrink-0" size={20} />
                    <span>Up to <strong>{plan.includedPieces} pieces</strong> (Dry Clean)</span>
                  </li>
                )}
                <li className="flex items-center gap-3 text-gray-300">
                  <Zap className="text-brand-400 shrink-0" size={20} />
                  <span>Free Pickup & Delivery</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Package className="text-brand-400 shrink-0" size={20} />
                  <span>Premium Packaging</span>
                </li>
              </ul>
              
              <button
                onClick={() => {
                  if (!currentSub && window.confirm(`Subscribe to ${plan.name} for ₹${plan.price}/month? (Mock Payment)`)) {
                    subscribe.mutate(plan.id);
                  }
                }}
                disabled={!!currentSub || subscribe.isPending}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  currentSub 
                    ? 'bg-surface-border text-gray-500 cursor-not-allowed'
                    : 'bg-brand-gradient text-white hover:shadow-glow-brand'
                }`}
              >
                {subscribe.isPending && subscribe.variables === plan.id ? (
                  <Loader2 className="animate-spin mx-auto" size={24} />
                ) : currentSub ? (
                  'Already Subscribed'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
