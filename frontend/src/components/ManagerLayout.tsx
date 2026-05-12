import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store, User, LogOut, Waves } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/manager/orders',    icon: ShoppingBag,     label: 'All Orders'     },
  { to: '/manager/pos',       icon: Store,           label: 'Walk-In POS'   },
  { to: '/manager/account',   icon: User,            label: 'My Account'    },
];

export default function ManagerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-surface text-white">
      <aside className="w-60 shrink-0 bg-surface-dark border-r border-surface-border flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-surface-border">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Waves size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none">Lather & Line</p>
            <p className="text-xs text-yellow-400 mt-0.5">Manager Portal</p>
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
                    ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20'
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

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
