package com.latherline.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SubscriptionDto {

    @Data
    public static class PlanResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer includedKg;
        private Integer includedPieces;
        private Boolean isActive;
    }

    @Data
    public static class UserSubscriptionResponse {
        private Long id;
        private PlanResponse plan;
        private String status;
        private LocalDateTime currentPeriodEnd;
        private Integer remainingKg;
        private Integer remainingPieces;
    }
}
