package com.latherline.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank
        private String fullName;

        private String phone;

        /**
         * Invite code that identifies which business this user belongs to.
         * Must match the 'code' column of an active business row.
         * Required — registration will fail without a valid code.
         */
        @NotBlank(message = "Business invite code is required. Ask your business owner for the code.")
        private String businessCode;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String email;
        private String fullName;
        private String role;
        private Long businessId;
        private String phone;
    }

    @Data
    @AllArgsConstructor
    public static class AuthSession {
        private String token;
        private AuthResponse user;
    }
}
