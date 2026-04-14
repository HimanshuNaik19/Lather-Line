import { Link } from 'react-router-dom';
import { Shirt, Sparkles, Clock, Shield, ArrowRight, Star } from 'lucide-react';

const SERVICES = [
  { name: 'Wash & Fold',    price: '₹49/kg',          emoji: '🫧', desc: 'Clean, fresh, folded perfectly' },
  { name: 'Dry Cleaning',   price: '₹199/garment',    emoji: '👔', desc: 'Professional garment care' },
  { name: 'Steam Ironing',  price: '₹29/piece',       emoji: '♨️', desc: 'Crisp, wrinkle-free results' },
  { name: 'Premium Laundry',price: '₹79/kg',          emoji: '✨', desc: 'Premium detergents & care' },
];

const FEATURES = [
  { icon: Clock,   title: '48-hr Turnaround', desc: 'Express same-day service available' },
  { icon: Shield,  title: 'Quality Guarantee', desc: 'Re-clean if not 100% satisfied' },
  { icon: Sparkles,title: 'Eco-Friendly',     desc: 'Green detergents & sustainable processes' },
];

const STEPS = [
  { step: '01', title: 'Schedule Pickup', desc: 'Choose your service, set a pickup time.' },
  { step: '02', title: 'We Collect',      desc: 'Our team picks up from your door.' },
  { step: '03', title: 'Expert Cleaning', desc: 'Professional care with quality products.' },
  { step: '04', title: 'Delivered Back',  desc: 'Clean clothes back at your door.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-hero-gradient">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300 text-sm mb-6">
            <Star size={13} className="fill-brand-400 text-brand-400" />
            Rated 4.9 · 10,000+ happy customers
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
            Laundry Made{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient">
              Effortless
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Premium laundry and dry-cleaning delivered from your doorstep. Schedule in seconds, track in real-time, enjoy spotless results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              id="hero-cta-register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-105 transition-all duration-200"
            >
              Schedule a Pickup <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-surface-border text-gray-300 hover:bg-surface-card hover:border-brand-500/50 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-surface-border">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-card-gradient border border-surface-border hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3">Our Services</h2>
            <p className="text-gray-400">Professional care for every fabric</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map(({ name, price, emoji, desc }) => (
              <div
                key={name}
                className="group p-5 rounded-2xl bg-card-gradient border border-surface-border hover:border-brand-500/60 hover:shadow-glow-brand hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-white mb-1">{name}</h3>
                <p className="text-xs text-gray-400 mb-3">{desc}</p>
                <p className="text-brand-400 font-bold text-sm">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-hero-gradient border-t border-surface-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3">How It Works</h2>
            <p className="text-gray-400">From your door to spotless in 4 steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center font-display font-bold text-white text-lg shadow-glow-brand">
                  {step}
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-surface-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-card-gradient border border-brand-500/30 shadow-glow-brand">
            <Shirt size={40} className="text-brand-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl mb-3">Ready for fresh clothes?</h2>
            <p className="text-gray-400 mb-6">Sign up free. First pickup is on us. No hidden fees.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-105 transition-all"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-border text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Lather &amp; Line. All rights reserved.
      </footer>
    </main>
  );
}
