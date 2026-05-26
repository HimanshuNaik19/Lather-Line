package com.latherline.service;

import com.latherline.config.StripeConfig;
import com.latherline.entity.Order;
import com.latherline.enums.PaymentStatus;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    private final StripeConfig stripeConfig;
    private final OrderRepository orderRepository;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public PaymentService(StripeConfig stripeConfig, OrderRepository orderRepository) {
        this.stripeConfig = stripeConfig;
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        if (stripeConfig.isConfigured()) {
            Stripe.apiKey = stripeConfig.getApiKey();
            log.info("Stripe SDK initialized with provided API key.");
        } else {
            log.warn("Stripe API key not provided. Falling back to MOCK Payment mode.");
        }
    }

    @Transactional
    public String createCheckoutSession(UUID orderPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderPublicId));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Order is already paid.");
        }

        if (!stripeConfig.isConfigured()) {
            // MOCK Payment Mode: immediately mark as paid and return a dummy URL
            log.info("MOCK PAYMENT: Auto-approving payment for order {}", orderPublicId);
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStripeSessionId("mock_session_" + UUID.randomUUID().toString());
            orderRepository.save(order);
            
            // Return success URL immediately to simulate a successful payment redirect
            return frontendUrl + "/customer/orders/" + orderPublicId + "?payment=success";
        }

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/customer/orders/" + orderPublicId + "?payment=success")
                .setCancelUrl(frontendUrl + "/customer/orders/" + orderPublicId + "?payment=cancelled")
                .setCustomerEmail(order.getUser().getEmail())
                .setClientReferenceId(orderPublicId.toString())
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(order.getTotalAmount().multiply(new BigDecimal("100")).longValue())
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Lather & Line Order #" + orderPublicId.toString().substring(0, 8).toUpperCase())
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            Session session = Session.create(params);
            
            order.setStripeSessionId(session.getId());
            orderRepository.save(order);

            return session.getUrl();
        } catch (Exception e) {
            log.error("Failed to create Stripe Checkout Session", e);
            throw new RuntimeException("Could not initiate payment process.", e);
        }
    }

    @Transactional
    public void markAsPaid(UUID orderPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderPublicId));
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);
        log.info("Order {} manually marked as PAID.", orderPublicId);
    }
}
