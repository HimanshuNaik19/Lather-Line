// ── Analytics / Dashboard types ───────────────────────────────────────────────

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ServiceRevenue {
  name: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  dailyRevenue: DailyRevenue[];
  statusBreakdown: StatusCount[];
  topServices: ServiceRevenue[];
}
