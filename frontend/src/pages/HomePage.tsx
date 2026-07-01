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
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden border-b border-surface-border">
        {/* Background Image & Blending */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-illustration.png" alt="Futuristic Laundry Machine" className="w-full h-full object-cover opacity-50 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/40 to-surface z-10" />
          <div className="absolute inset-0 bg-brand-900/10 z-10 mix-blend-overlay" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto text-center mt-12 pb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-brand-500/40 bg-surface/50 backdrop-blur-md text-brand-300 text-sm mb-8 animate-fade-in shadow-glow-brand">
            <Star size={14} className="fill-brand-400 text-brand-400" />
            Rated 4.9 · 10,000+ happy customers
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6 text-white drop-shadow-2xl animate-slide-up">
            Laundry Made{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient filter drop-shadow-lg">
              Effortless
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Premium laundry and dry-cleaning delivered from your doorstep. Schedule in seconds, track in real-time, enjoy spotless results.
          </p>
        </div>

        {/* Floating Edge Buttons (Dock style) */}
        <div className="absolute bottom-8 left-4 right-4 z-30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 justify-center bg-surface/60 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Link
              to="/register"
              id="hero-cta-register"
              className="flex-[2] inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-gradient text-white font-bold text-lg hover:shadow-glow-brand hover:scale-[1.02] transition-all duration-300"
            >
              Schedule a Pickup <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-surface-border">
        <h2 className="sr-only">Why Choose Us</h2>
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
              <Link
                to="/register"
                key={name}
                className="group p-5 rounded-2xl bg-card-gradient border border-surface-border hover:border-brand-500/60 hover:shadow-glow-brand hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-white mb-1">{name}</h3>
                <p className="text-xs text-gray-400 mb-3">{desc}</p>
                <p className="text-brand-400 font-bold text-sm">{price}</p>
              </Link>
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

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3">Loved by Customers</h2>
            <p className="text-gray-400">Don't just take our word for it</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Working Professional", text: "Lather & Line has completely changed my weekends. I just schedule a pickup on the app and my clothes come back perfect within 48 hours." },
              { name: "Rahul Verma", role: "Business Owner", text: "The dry cleaning quality is unmatched. They even managed to remove a tough coffee stain from my favorite suit. Highly recommended!" },
              { name: "Sneha Patel", role: "Busy Mom", text: "With kids, laundry is endless. The subscription plan saves me so much money and the real-time tracking gives me peace of mind." }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card-gradient border border-surface-border">
                <div className="flex text-brand-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} className="fill-current" />)}
                </div>
                <p className="text-gray-300 mb-6 text-sm italic">"{t.text}"</p>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-surface-border bg-hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-card-gradient border border-brand-500/30 shadow-glow-brand relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
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

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-8 px-4 border-t border-surface-border bg-surface-card">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Shirt size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Lather <span className="text-brand-400">&</span> Line
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Premium laundry and dry-cleaning delivered from your doorstep.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Wash & Fold</li>
              <li>Dry Cleaning</li>
              <li>Steam Ironing</li>
              <li>Premium Care</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@latherandline.com</li>
              <li>+91 98765 43210</li>
              <li>123 Laundry Street, Mumbai</li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto pt-8 border-t border-surface-border text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Lather & Line. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
