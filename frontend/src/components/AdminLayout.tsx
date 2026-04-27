import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Inbox, Loader2, LogOut, Settings } from 'lucide-react';

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-page-gradient flex items-center justify-center text-white"><Loader2 size={36} className="animate-spin text-brand-400" /></div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders',   path: '/admin/orders',    icon: Inbox },
    { label: 'Services', path: '/admin/services',  icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-page-gradient text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-dark border-r border-surface-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-surface-border">
          <span className="font-display font-bold text-xl text-white">Business <span className="text-brand-400">Portal</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-surface-input rounded-xl border border-surface-border">
             <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold">
               {user.fullName.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium truncate">{user.fullName}</p>
               <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="h-16 bg-surface-dark border-b border-surface-border flex items-center justify-between px-4 md:hidden">
            <span className="font-display font-bold text-lg">Business <span className="text-brand-400">Portal</span></span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut size={20} />
            </button>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
