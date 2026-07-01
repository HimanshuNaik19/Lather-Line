import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store, User, LogOut, Waves, Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface text-white">
      {/* Desktop Sidebar */}
      <aside className="w-60 shrink-0 bg-surface-dark border-r border-surface-border hidden md:flex flex-col">
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

      {/* Mobile Header */}
      <header className="h-16 bg-surface-dark border-b border-surface-border flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm">Lather & Line</span>
            <span className="text-xs text-yellow-400">Manager</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-surface-dark border-r border-surface-border flex flex-col animate-slide-in-right h-full">
            <div className="h-16 flex items-center justify-between px-6 border-b border-surface-border">
              <span className="font-display font-bold text-lg text-white">Manager Portal</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
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

            <div className="p-4 border-t border-surface-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto h-[calc(100vh-4rem)] md:h-screen">
        <Outlet />
      </main>
    </div>
  );
}
