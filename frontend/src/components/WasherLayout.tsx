import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, User, LogOut, Waves } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/washer/orders', icon: ShoppingBag, label: 'Active Orders' },
  { to: '/washer/pos',    icon: Store,       label: 'Walk-In POS'   },
  { to: '/washer/account', icon: User,       label: 'My Account'    },
];

export default function WasherLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-surface text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface-dark border-r border-surface-border flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-surface-border">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Waves size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none">Lather & Line</p>
            <p className="text-xs text-brand-400 mt-0.5">Washer Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-card'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
