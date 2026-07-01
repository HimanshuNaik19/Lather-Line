import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useProfitabilityReport } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import { IndianRupee, Package, Clock, CheckCircle2, XCircle, Loader2, TrendingUp } from 'lucide-react';

// ── Palette ───────────────────────────────────────────────────────────────────
const BRAND      = '#818cf8'; // indigo
const STATUS_COLORS: Record<string, string> = {
  PENDING:     '#facc15',
  PICKED_UP:   '#60a5fa',
  IN_PROGRESS: '#a78bfa',
  READY:       '#34d399',
  DELIVERED:   '#4ade80',
  CANCELLED:   '#f87171',
};
const BAR_COLORS = ['#818cf8', '#60a5fa', '#34d399', '#facc15', '#f87171'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const currency = (v: number) => `₹${v?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const CustomTooltipRevenue = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-dark border border-surface-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-brand-400 font-bold">{currency(payload[0]?.value)}</p>
      <p className="text-gray-400 text-xs">{payload[1]?.value ?? 0} orders</p>
    </div>
  );
};

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-dark border border-surface-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-brand-400 font-bold">{currency(payload[0]?.value)}</p>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  sub?: string;
}
function StatCard({ label, value, icon: Icon, iconColor, iconBg, sub }: StatCardProps) {
  return (
    <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/40 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl border border-white/5 ${iconBg}`}>
          <Icon className={iconColor} size={22} />
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-6 py-4 border-b border-surface-border">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: profitReport } = useProfitabilityReport();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={40} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-xl border border-red-500/40 text-red-400">
        Failed to load dashboard analytics.
      </div>
    );
  }

  // Format daily data for Recharts — shorten date labels
  const revenueData = stats.dailyRevenue.map(d => ({
    ...d,
    revenue: Number(d.revenue),
    label: format(new Date(d.date), 'dd MMM'),
  }));

  // Top services
  const serviceData = stats.topServices.map(s => ({
    ...s,
    revenue: Number(s.revenue),
  }));

  // Status pie
  const pieData = stats.statusBreakdown.map(s => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#6b7280',
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Store Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Live overview of your laundry operations</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={currency(Number(stats.totalRevenue))}
          icon={IndianRupee}
          iconColor="text-green-400"
          iconBg="bg-green-400/10"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          iconColor="text-brand-400"
          iconBg="bg-brand-400/10"
        />
        <StatCard
          label="Pending"
          value={stats.pendingOrders}
          icon={Clock}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-400/10"
          sub="Awaiting pickup"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressOrders}
          icon={TrendingUp}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
          sub="Being processed"
        />
      </div>

      {/* ── Profitability Widget ── */}
      {profitReport && (
        <div className="bg-surface-dark border border-brand-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          <SectionHeader title="Financial Overview" sub="Real-time profitability margin" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Gross Revenue</p>
              <p className="text-xl font-bold font-mono text-green-400">{currency(profitReport.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Cost of Goods (COGS)</p>
              <p className="text-xl font-bold font-mono text-yellow-400">- {currency(profitReport.totalCogs)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Expenses</p>
              <p className="text-xl font-bold font-mono text-red-400">- {currency(profitReport.totalOperatingExpenses)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Net Profit Margin</p>
              <p className={`text-2xl font-bold font-mono ${profitReport.profitMarginPercentage > 0 ? 'text-brand-400' : 'text-red-400'}`}>
                {profitReport.profitMarginPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Revenue Chart (Area) ── */}
      <div className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
        <SectionHeader title="Revenue — Last 30 Days" sub="Daily revenue trend across all orders" />
        <div className="p-6">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor={BRAND} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltipRevenue />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={BRAND}
                strokeWidth={2}
                fill="url(#revGradient)"
                dot={false}
                activeDot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Pie + Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status — Donut */}
        <div className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
          <SectionHeader title="Orders by Status" sub="Distribution across order lifecycle stages" />
          <div className="p-6 flex items-center justify-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, 'Orders']}
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="space-y-2 flex-1">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="text-xs text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Services — Bar */}
        <div className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
          <SectionHeader title="Top Services by Revenue" sub="Best-performing services across all orders" />
          <div className="p-6">
            {serviceData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
                No service data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={serviceData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltipBar />} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {serviceData.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Badges ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Completed', value: stats.completedOrders, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'In Progress / Picked Up', value: stats.inProgressOrders, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-dark border border-surface-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl border border-white/5 ${bg}`}>
              <Icon className={color} size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
