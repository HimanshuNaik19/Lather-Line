package com.latherline.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class PaymentDto {

    public record CreatePaymentResponse(
            String razorpayOrderId,
            BigDecimal amount,
            String currency,
            String keyId
    ) {}

    public record VerifyPaymentRequest(
            @NotNull UUID orderPublicId,
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature
    ) {}
}
