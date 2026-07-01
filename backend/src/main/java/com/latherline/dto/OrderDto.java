package com.latherline.dto;

import com.latherline.enums.OrderStatus;
import com.latherline.enums.PaymentStatus;
import com.latherline.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {

    // ── Item-level DTO used inside CreateRequest ──────────────────────────────
    @Data
    public static class OrderItemRequest {
        @NotNull(message = "serviceTypeId is required")
        private Long serviceTypeId;

        /** KG (e.g. 2.5) or pieces (e.g. 3) — must be positive */
        @NotNull(message = "quantity is required")
        @DecimalMin(value = "0.001", message = "quantity must be positive")
        private BigDecimal quantity;

        /** Optional garment label e.g. "Shirt", "Pants" */
        private String label;
    }

    // ── Item-level DTO in responses ───────────────────────────────────────────
    @Data
    public static class OrderItemResponse {
        private Long serviceTypeId;
        private String serviceName;
        private String unit;         // "KG" or "PIECE"
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String label;
    }

    // ── Walk-In POS request (single item, quick entry) ────────────────────────
    @Data
    public static class PosCreateRequest {
        @NotNull
        private String customerPhone;

        @NotNull
        private String customerName;

        @Valid
        @NotEmpty(message = "At least one item is required")
        private List<OrderItemRequest> items;

        private String specialInstructions;
        
        private String couponCode;

        private PaymentMethod paymentMethod;
    }

    // ── Customer online order request ─────────────────────────────────────────
    @Data
    public static class CreateRequest {
        @Valid
        @NotEmpty(message = "At least one item is required")
        private List<OrderItemRequest> items;

        @NotNull private String street;
        @NotNull private String city;
        @NotNull private String state;
        @NotNull private String pinCode;

        public String getStreet() { return street; }
        public String getCity()   { return city;   }
        public String getState()  { return state;  }
        public String getPinCode(){ return pinCode; }

        @NotNull
        @Future(message = "Pickup time must be in the future")
        private LocalDateTime pickupTime;

        private String specialInstructions;
        
        private String couponCode;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;
    }

    // ── Status update ─────────────────────────────────────────────────────────
    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private OrderStatus orderStatus;
    }

    // ── Order response (returned for all GET / POST endpoints) ────────────────
    @Data
    public static class OrderResponse {
        private UUID publicId;
        private String customerName;        // useful for admin / washer views
        private String customerPhone;
        private List<OrderItemResponse> items;
        private String addressCity;
        private String addressStreet;
        private LocalDateTime pickupTime;
        private OrderStatus orderStatus;
        private PaymentStatus paymentStatus;
        private PaymentMethod paymentMethod;
        private String razorpayOrderId;
        private BigDecimal subtotalAmount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String couponCode;
        private String specialInstructions;
        private LocalDateTime createdAt;
        private String driverName;
        private Long driverId;
        private Double addressLatitude;
        private Double addressLongitude;
    }
}
