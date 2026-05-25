package com.latherline.service;

import com.latherline.dto.DashboardDto;
import com.latherline.enums.OrderStatus;
import com.latherline.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

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
            // row[0] can be java.sql.Date or LocalDate depending on the JPA provider
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
}
