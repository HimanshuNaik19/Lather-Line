import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import { OrderWebSocket } from '@/components/OrderWebSocket';

// Layouts
import AdminLayout from '@/components/AdminLayout';
import WasherLayout from '@/components/WasherLayout';
import ManagerLayout from '@/components/ManagerLayout';

// Customer pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import NewOrderPage from '@/pages/NewOrderPage';
import AccountPage from '@/pages/AccountPage';
import SettingsPage from '@/pages/SettingsPage';

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailsPage from '@/pages/admin/AdminOrderDetailsPage';
import AdminServicesPage from '@/pages/admin/AdminServicesPage';
import POSPage from '@/pages/admin/POSPage';

// Washer pages
import WasherOrdersPage from '@/pages/washer/WasherOrdersPage';

// Manager pages
import ManagerDashboardPage from '@/pages/manager/ManagerDashboardPage';
import ManagerOrdersPage from '@/pages/manager/ManagerOrdersPage';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// ── Route guards ──────────────────────────────────────────────────────────────

function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-white">
      <Loader2 size={36} className="animate-spin text-brand-400" />
    </div>
  );
}

/** Requires authentication — any role */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Requires CUSTOMER role specifically */
function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CUSTOMER') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires ADMIN role */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires MANAGER or ADMIN */
function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires WASHER, MANAGER, or ADMIN */
function WasherRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!['WASHER', 'MANAGER', 'ADMIN'].includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Maps role to its home URL */
function roleHome(role: string): string {
  switch (role) {
    case 'ADMIN':   return '/admin/dashboard';
    case 'MANAGER': return '/manager/dashboard';
    case 'WASHER':  return '/washer/orders';
    default:        return '/dashboard';
  }
}

// ── Global UI elements (Navbar + Chatbot hidden in staff portals) ─────────────
function GlobalUI() {
  const location = useLocation();
  const isStaffPortal = ['/admin', '/washer', '/manager'].some(p => location.pathname.startsWith(p));
  if (isStaffPortal) return null;
  return (
    <>
      <Navbar />
      <Chatbot />
    </>
  );
}

// ── App routes ────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <GlobalUI />
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Customer portal ── */}
        <Route path="/dashboard"  element={<CustomerRoute><DashboardPage /></CustomerRoute>} />
        <Route path="/orders/new" element={<CustomerRoute><NewOrderPage /></CustomerRoute>} />
        <Route path="/orders"     element={<CustomerRoute><OrdersPage /></CustomerRoute>} />
        <Route path="/account"    element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/settings"   element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* ── Admin portal ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders"    element={<AdminOrdersPage />} />
          <Route path="orders/:publicId" element={<AdminOrderDetailsPage />} />
          <Route path="services"  element={<AdminServicesPage />} />
          <Route path="pos"       element={<POSPage />} />
        </Route>

        {/* ── Manager portal ── */}
        <Route path="/manager" element={<ManagerRoute><ManagerLayout /></ManagerRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="orders"    element={<ManagerOrdersPage />} />
          <Route path="pos"       element={<POSPage />} />
          <Route path="account"   element={<AccountPage />} />
        </Route>

        {/* ── Washer portal ── */}
        <Route path="/washer" element={<WasherRoute><WasherLayout /></WasherRoute>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders"  element={<WasherOrdersPage />} />
          <Route path="pos"     element={<POSPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrderWebSocket />
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
