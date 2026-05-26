package com.latherline.controller;

import com.latherline.config.StripeConfig;
import com.latherline.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeConfig stripeConfig;

    @PostMapping("/checkout/{orderId}")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@PathVariable UUID orderId) {
        String checkoutUrl = paymentService.createCheckoutSession(orderId);
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/mark-paid/{orderId}")
    public ResponseEntity<Void> markAsPaid(@PathVariable UUID orderId) {
        paymentService.markAsPaid(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        if (!stripeConfig.isConfigured() || stripeConfig.getWebhookSecret() == null) {
            log.warn("Webhook received but Stripe is not fully configured.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not configured");
        }

        Event event = null;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isPresent()) {
                StripeObject stripeObject = dataObjectDeserializer.getObject().get();
                if (stripeObject instanceof Session) {
                    Session session = (Session) stripeObject;
                    String clientReferenceId = session.getClientReferenceId();
                    if (clientReferenceId != null) {
                        try {
                            paymentService.markAsPaid(UUID.fromString(clientReferenceId));
                            log.info("Successfully processed payment for order {}", clientReferenceId);
                        } catch (Exception e) {
                            log.error("Failed to mark order as paid: {}", clientReferenceId, e);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok("Success");
    }
}
