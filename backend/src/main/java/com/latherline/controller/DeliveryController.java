package com.latherline.controller;

import com.latherline.dto.OrderDto;
import com.latherline.service.OrderService;
import com.latherline.repository.UserRepository;
import com.latherline.entity.User;
import com.latherline.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping("/mine")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<OrderDto.OrderResponse>> getMyDeliveries(Authentication auth) {
        return ResponseEntity.ok(orderService.getDriverDeliveries(auth.getName()));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<OrderDto.OrderResponse>> getAvailableDeliveries() {
        return ResponseEntity.ok(orderService.getAvailableDeliveries());
    }

    @PostMapping("/{orderId}/claim")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<OrderDto.OrderResponse> claimDelivery(
            @PathVariable UUID orderId, Authentication auth) {
        return ResponseEntity.ok(orderService.claimDelivery(orderId, auth.getName()));
    }

    @PostMapping("/{orderId}/assign/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OrderDto.OrderResponse> assignDriver(
            @PathVariable UUID orderId, @PathVariable Long driverId) {
        return ResponseEntity.ok(orderService.assignDriver(orderId, driverId));
    }

    @GetMapping("/drivers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getDriverList() {
        List<User> drivers = userRepository.findByRole(UserRole.DRIVER);
        List<Map<String, Object>> result = drivers.stream()
                .map(d -> Map.<String, Object>of(
                        "id", d.getId(),
                        "fullName", d.getFullName(),
                        "email", d.getEmail()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
