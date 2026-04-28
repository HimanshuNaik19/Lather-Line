package com.latherline.controller;

import com.latherline.dto.OrderDto;
import com.latherline.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<OrderDto.OrderResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody OrderDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(user.getUsername(), request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Page<OrderDto.OrderResponse>> myOrders(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMyOrdersPaged(user.getUsername(), page, size));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto.OrderResponse>> allOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrdersPaged(page, size));
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'WASHER')")
    public ResponseEntity<OrderDto.OrderResponse> getByPublicId(
            @PathVariable UUID publicId,
            @AuthenticationPrincipal UserDetails user) {
        boolean canViewAll = user.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_WASHER".equals(a.getAuthority()));
        return ResponseEntity.ok(orderService.getOrderByPublicId(publicId, user.getUsername(), canViewAll));
    }

    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyRole('WASHER', 'ADMIN')")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @PathVariable UUID publicId,
            @RequestBody OrderDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(publicId, request.getOrderStatus()));
    }
}
