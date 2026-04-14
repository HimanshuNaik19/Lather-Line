package com.latherline.dto;

import com.latherline.enums.OrderStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDto {

    @Data
    public static class CreateRequest {
        @NotNull
        private Long serviceTypeId;

        @NotNull
        private String street;

        @NotNull
        private String city;

        @NotNull
        private String state;

        @NotNull
        private String pinCode;

        public String getStreet() { return street; }
        public String getCity() { return city; }
        public String getState() { return state; }
        public String getPinCode() { return pinCode; }

        @NotNull @Future(message = "Pickup time must be in the future")
        private LocalDateTime pickupTime;

        @NotNull @Positive
        private BigDecimal totalAmount;

        private String specialInstructions;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private OrderStatus orderStatus;
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private String serviceTypeName;
        private String addressCity;
        private LocalDateTime pickupTime;
        private OrderStatus orderStatus;
        private BigDecimal totalAmount;
        private String specialInstructions;
        private LocalDateTime createdAt;
    }
}
