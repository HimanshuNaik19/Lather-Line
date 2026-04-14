package com.latherline.controller;

import com.latherline.dto.OrderDto;
import com.latherline.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /** Create a new order — authenticated customers only */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.OrderResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody OrderDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(user.getUsername(), request));
    }

    /** List my orders */
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<OrderDto.OrderResponse>> myOrders(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getUsername()));
    }

    /** List ALL orders for the Tenant (Business Admins) */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto.OrderResponse>> allOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /** Get a single order by ID */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getOrderById(id, user.getUsername()));
    }

    /** Update order status — washers and admins only */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('WASHER', 'ADMIN')")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody OrderDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.getOrderStatus()));
    }
}
