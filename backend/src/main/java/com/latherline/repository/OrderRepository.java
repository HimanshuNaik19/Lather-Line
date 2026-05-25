package com.latherline.repository;

import com.latherline.entity.Order;
import com.latherline.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByOrderStatus(OrderStatus status);
    List<Order> findByOrderStatusIn(List<OrderStatus> statuses);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByPublicId(UUID publicId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ── Analytics queries ─────────────────────────────────────────────────────
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :status")
    long countByStatus(@Param("status") OrderStatus status);

    /** Daily revenue & order count grouped by calendar date for last :days days */
    @Query("SELECT CAST(o.createdAt AS date), SUM(o.totalAmount), COUNT(o) " +
           "FROM Order o " +
           "WHERE o.createdAt >= :since " +
           "GROUP BY CAST(o.createdAt AS date) " +
           "ORDER BY CAST(o.createdAt AS date)")
    List<Object[]> dailyRevenueGrouped(@Param("since") LocalDateTime since);

    /** Top services by sum of their item subtotals */
    @Query("SELECT oi.serviceType.name, SUM(oi.subtotal), COUNT(DISTINCT oi.order) " +
           "FROM OrderItem oi " +
           "GROUP BY oi.serviceType.name " +
           "ORDER BY SUM(oi.subtotal) DESC")
    List<Object[]> topServicesByRevenue(Pageable pageable);
}
