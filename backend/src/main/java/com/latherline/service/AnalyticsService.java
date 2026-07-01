package com.latherline.service;

import com.latherline.entity.Expense;
import com.latherline.entity.Order;
import com.latherline.enums.OrderStatus;
import com.latherline.repository.ExpenseRepository;
import com.latherline.repository.OrderRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.latherline.dto.DashboardDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ExpenseRepository expenseRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public DashboardDto.DashboardStats getDashboardStats() {
        // ── Aggregate counts ─────────────────────────────────────────────────
        BigDecimal totalRevenue   = orderRepository.sumTotalRevenue();
        long totalOrders          = orderRepository.count();
        long pendingOrders        = orderRepository.countByStatus(OrderStatus.PENDING);
        long inProgressOrders     = orderRepository.countByStatus(OrderStatus.IN_PROGRESS)
                                  + orderRepository.countByStatus(OrderStatus.PICKED_UP);
        long completedOrders      = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders      = orderRepository.countByStatus(OrderStatus.CANCELLED);

        // ── Daily revenue (last 30 days) ──────────────────────────────────────
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rawDaily = orderRepository.dailyRevenueGrouped(since);

        // Build a map date→row so we can fill gaps with zero
        Map<String, DashboardDto.DailyRevenue> dailyMap = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            String d = LocalDate.now().minusDays(i).format(DATE_FMT);
            dailyMap.put(d, new DashboardDto.DailyRevenue(d, BigDecimal.ZERO, 0L));
        }
        for (Object[] row : rawDaily) {
            String date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate().format(DATE_FMT);
            } else {
                date = row[0].toString().substring(0, 10);
            }
            BigDecimal rev  = (BigDecimal) row[1];
            Long count      = ((Number) row[2]).longValue();
            if (dailyMap.containsKey(date)) {
                dailyMap.put(date, new DashboardDto.DailyRevenue(date, rev, count));
            }
        }
        List<DashboardDto.DailyRevenue> dailyRevenue = new ArrayList<>(dailyMap.values());

        // ── Status breakdown ──────────────────────────────────────────────────
        List<DashboardDto.StatusCount> statusBreakdown = Arrays.stream(OrderStatus.values())
                .map(s -> new DashboardDto.StatusCount(s.name(), orderRepository.countByStatus(s)))
                .filter(sc -> sc.getCount() > 0)
                .collect(Collectors.toList());

        // ── Top 5 services ────────────────────────────────────────────────────
        List<Object[]> rawServices = orderRepository.topServicesByRevenue(PageRequest.of(0, 5));
        List<DashboardDto.ServiceRevenue> topServices = rawServices.stream()
                .map(row -> new DashboardDto.ServiceRevenue(
                        (String) row[0],
                        (BigDecimal) row[1],
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());

        return new DashboardDto.DashboardStats(
                totalRevenue,
                totalOrders,
                pendingOrders,
                inProgressOrders,
                completedOrders,
                cancelledOrders,
                dailyRevenue,
                statusBreakdown,
                topServices
        );
    }

    @Data
    public static class ProfitabilityReport {
        private BigDecimal totalRevenue;
        private BigDecimal totalCogs;
        private BigDecimal totalOperatingExpenses;
        private BigDecimal netProfit;
        private BigDecimal profitMarginPercentage;
    }

    public ProfitabilityReport getProfitabilityReport(Long businessId, LocalDate startDate, LocalDate endDate) {
        // Here we could pass startDate and endDate to repositories, but for simplicity we fetch all for business ID if not using dates yet.
        // Assuming OrderRepository has a method to get orders by businessId. Let's just fetch all orders and filter for now
        // if we don't have custom queries. In a real app we would use custom JPA queries.
        
        // Since we don't have findByBusinessId in OrderRepository easily exposed, we'll fetch all orders and filter. 
        // Note: For multi-tenant, all orders have a businessId via tenant filter, but let's assume we can query them.
        List<Order> orders = orderRepository.findAll();
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCogs = BigDecimal.ZERO;

        for (Order order : orders) {
            if (order.getBusinessId().equals(businessId) && order.getOrderStatus() != OrderStatus.CANCELLED) {
                totalRevenue = totalRevenue.add(order.getTotalAmount());
                totalCogs = totalCogs.add(order.getCogs());
            }
        }

        List<Expense> expenses = expenseRepository.findByBusinessId(businessId);
        BigDecimal totalOperatingExpenses = BigDecimal.ZERO;
        for (Expense expense : expenses) {
            totalOperatingExpenses = totalOperatingExpenses.add(expense.getAmount());
        }

        BigDecimal netProfit = totalRevenue.subtract(totalCogs).subtract(totalOperatingExpenses);
        
        BigDecimal profitMarginPercentage = BigDecimal.ZERO;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMarginPercentage = netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        ProfitabilityReport report = new ProfitabilityReport();
        report.setTotalRevenue(totalRevenue);
        report.setTotalCogs(totalCogs);
        report.setTotalOperatingExpenses(totalOperatingExpenses);
        report.setNetProfit(netProfit);
        report.setProfitMarginPercentage(profitMarginPercentage);

        return report;
    }
}
