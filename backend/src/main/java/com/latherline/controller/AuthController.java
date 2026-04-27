package com.latherline.controller;

import com.latherline.config.JwtUtil;
import com.latherline.dto.AuthDto;
import com.latherline.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthSession session = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildJwtCookie(session.getToken()).toString())
                .body(session.getUser());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthSession session = authService.login(request);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, buildJwtCookie(session.getToken()).toString())
                .body(session.getUser());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthDto.AuthResponse> me(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(authService.getCurrentUser(user.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity
                .noContent()
                .header(HttpHeaders.SET_COOKIE, clearJwtCookie().toString())
                .build();
    }

    private ResponseCookie clearJwtCookie() {
        return ResponseCookie.from(jwtUtil.getCookieName(), "")
                .httpOnly(true)
                .secure(jwtUtil.isCookieSecure())
                .path("/")
                .maxAge(0)
                .sameSite(jwtUtil.getCookieSameSite())
                .build();
    }

    private ResponseCookie buildJwtCookie(String token) {
        return ResponseCookie.from(jwtUtil.getCookieName(), token)
                .httpOnly(true)
                .secure(jwtUtil.isCookieSecure())
                .path("/")
                .maxAge(jwtUtil.getExpirationSeconds())
                .sameSite(jwtUtil.getCookieSameSite())
                .build();
    }
}
