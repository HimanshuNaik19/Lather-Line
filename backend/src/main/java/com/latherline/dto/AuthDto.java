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
         * Must match the 'code' column of the businesses table (e.g. "sunshine").
         * Defaults to "sunshine" so existing flows keep working.
         */
        private String businessCode = "sunshine";
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;

        // Optional - defaults to business 1 if not provided
        private Long businessId = 1L;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String email;
        private String fullName;
        private String role;
    }

    @Data
    @AllArgsConstructor
    public static class AuthSession {
        private String token;
        private AuthResponse user;
    }
}
