package com.latherline.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardStats {
        private BigDecimal totalRevenue;
        private long totalOrders;
        private long pendingOrders;
        private long inProgressOrders;
        private long completedOrders;
        private long cancelledOrders;
        /** Daily revenue for the last 30 days: [{date: "2026-05-01", revenue: 4500.00}, ...] */
        private List<DailyRevenue> dailyRevenue;
        /** Per-status breakdown: [{status: "PENDING", count: 5}, ...] */
        private List<StatusCount> statusBreakdown;
        /** Top services by total revenue: [{name: "Dry Cleaning", revenue: 12000}, ...] */
        private List<ServiceRevenue> topServices;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyRevenue {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ServiceRevenue {
        private String name;
        private BigDecimal revenue;
        private long orderCount;
    }
}
