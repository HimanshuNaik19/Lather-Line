package com.latherline.controller;

import com.latherline.dto.PaymentDto.CreatePaymentResponse;
import com.latherline.dto.PaymentDto.VerifyPaymentRequest;
import com.latherline.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create/{publicId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<CreatePaymentResponse> createPayment(@PathVariable UUID publicId) {
        return ResponseEntity.ok(paymentService.createPaymentForOrder(publicId));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyPayment(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-paid/{publicId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WASHER')")
    public ResponseEntity<Void> markAsPaid(@PathVariable UUID publicId) {
        paymentService.markAsPaid(publicId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/key")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("keyId", keyId));
    }
}
