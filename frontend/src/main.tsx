import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import NewOrderPage from '@/pages/NewOrderPage';
import AccountPage from '@/pages/AccountPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailsPage from '@/pages/admin/AdminOrderDetailsPage';
import AdminServicesPage from '@/pages/admin/AdminServicesPage';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Guard customer routes — redirect to login if not authenticated */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-white">
        <Loader2 size={36} className="animate-spin text-brand-400" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Hide the customer Navbar & Chatbot on admin pages */
function GlobalUI() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return (
    <>
      <Navbar />
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GlobalUI />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer */}
        <Route path="/dashboard"  element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/orders/new" element={<PrivateRoute><NewOrderPage /></PrivateRoute>} />
        <Route path="/orders"     element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/account"    element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/settings"   element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Admin (Business Owner Portal) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
