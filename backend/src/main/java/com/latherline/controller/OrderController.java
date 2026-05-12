package com.latherline.controller;

import com.latherline.dto.OrderDto;
import com.latherline.enums.OrderStatus;
import com.latherline.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ── Customer: create online order ─────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderDto.CreateRequest request) {
        return ResponseEntity.status(201)
                .body(orderService.createOrder(userDetails.getUsername(), request));
    }

    // ── Staff: create walk-in POS order ──────────────────────────────────────
    @PostMapping("/pos")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WASHER')")
    public ResponseEntity<OrderDto.OrderResponse> createPosOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderDto.PosCreateRequest request) {
        return ResponseEntity.status(201)
                .body(orderService.createPosOrder(userDetails.getUsername(), request));
    }

    // ── Customer: view own orders ─────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDto.OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getUsername()));
    }

    @GetMapping("/paged")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getMyOrdersPaged(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMyOrdersPaged(userDetails.getUsername(), page, size));
    }

    // ── Admin/Manager/Washer: view all orders ─────────────────────────────────
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WASHER')")
    public ResponseEntity<List<OrderDto.OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/all/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WASHER')")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getAllOrdersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrdersPaged(page, size));
    }

    // ── Washer: only PICKED_UP and IN_PROGRESS orders ────────────────────────
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('WASHER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<OrderDto.OrderResponse>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
    }

    // ── Shared: single order by publicId ─────────────────────────────────────
    @GetMapping("/{publicId}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(
            @PathVariable UUID publicId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().matches("ROLE_ADMIN|ROLE_MANAGER|ROLE_WASHER"));
        return ResponseEntity.ok(orderService.getOrderByPublicId(publicId, userDetails.getUsername(), isStaff));
    }

    // ── Staff: update order status ────────────────────────────────────────────
    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WASHER')")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @PathVariable UUID publicId,
            @Valid @RequestBody OrderDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(publicId, request.getOrderStatus()));
    }
}
