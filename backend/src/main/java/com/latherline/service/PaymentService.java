package com.latherline.service;

import com.latherline.dto.PaymentDto.CreatePaymentResponse;
import com.latherline.dto.PaymentDto.VerifyPaymentRequest;
import com.latherline.entity.Order;
import com.latherline.enums.PaymentStatus;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient; // can be null if keys not set

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    @Autowired
    public PaymentService(OrderRepository orderRepository, @Autowired(required = false) RazorpayClient razorpayClient) {
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
    }

    @Transactional
    public CreatePaymentResponse createPaymentForOrder(UUID publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + publicId));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Order is already paid.");
        }

        if (razorpayClient == null) {
            log.warn("Razorpay is not configured. Mocking payment creation.");
            String mockOrderId = "order_mock_" + System.currentTimeMillis();
            order.setRazorpayOrderId(mockOrderId);
            orderRepository.save(order);
            return new CreatePaymentResponse(mockOrderId, order.getTotalAmount(), "INR", "mock_key_id");
        }

        try {
            // Razorpay takes amount in paise (multiply by 100)
            int amountInPaise = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + order.getPublicId().toString().substring(0, 8));

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            order.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(order);

            return new CreatePaymentResponse(razorpayOrderId, order.getTotalAmount(), "INR", keyId);
        } catch (Exception e) {
            log.error("Failed to create Razorpay order", e);
            throw new RuntimeException("Could not initiate payment: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyPayment(VerifyPaymentRequest request) {
        Order order = orderRepository.findByPublicId(request.orderPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (razorpayClient == null) {
            log.warn("Razorpay is not configured. Mocking payment verification.");
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setRazorpayPaymentId(request.razorpayPaymentId());
            order.setRazorpaySignature(request.razorpaySignature());
            orderRepository.save(order);
            return;
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.razorpayOrderId());
            options.put("razorpay_payment_id", request.razorpayPaymentId());
            options.put("razorpay_signature", request.razorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setRazorpayPaymentId(request.razorpayPaymentId());
                order.setRazorpaySignature(request.razorpaySignature());
                orderRepository.save(order);
                log.info("Payment verified successfully for order {}", order.getPublicId());
            } else {
                order.setPaymentStatus(PaymentStatus.FAILED);
                orderRepository.save(order);
                throw new IllegalArgumentException("Invalid payment signature");
            }
        } catch (Exception e) {
            log.error("Error verifying payment signature", e);
            throw new RuntimeException("Payment verification failed", e);
        }
    }

    @Transactional
    public void markAsPaid(UUID publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + publicId));
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Order is already paid.");
        }
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentMethod(com.latherline.enums.PaymentMethod.CASH);
        orderRepository.save(order);
        log.info("Order {} manually marked as PAID via Cash.", order.getPublicId());
    }
}
