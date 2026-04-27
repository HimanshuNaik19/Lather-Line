package com.latherline.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    /*
     * JwtUtil has no Spring Security deps → safe to eagerly inject via constructor.
     *
     * UserDetailsService is a @Bean defined IN SecurityConfig, which also constructor-injects
     * JwtAuthFilter. Eager injection would create a circular dependency at boot.
     * Breaking it with @Lazy means the proxy is injected at construction time and the
     * real bean is resolved only on the first HTTP request — exactly what we want.
     */
    private final JwtUtil jwtUtil;

    @Lazy
    @Autowired
    private UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Try HttpOnly cookie (browser clients)
        String jwt = extractJwtFromCookie(request);

        // 2. Fall back to Authorization header (Postman / API clients)
        if (jwt == null) {
            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String finalJwt = jwt;

        try {
            final String userEmail = jwtUtil.extractUsername(finalJwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtUtil.isTokenValid(finalJwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Extract businessId for Multi-Tenancy
                    Long businessId = jwtUtil.extractClaim(finalJwt, claims -> claims.get("businessId", Long.class));
                    if (businessId != null) {
                        com.latherline.config.tenant.TenantContextHolder.setTenantId(businessId);
                    }
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            log.warn("JWT validation / processing failed: {}", ex.getMessage());
            filterChain.doFilter(request, response);
        } finally {
            com.latherline.config.tenant.TenantContextHolder.clear();
        }
    }

    /** Reads the JWT from the 'll_jwt' HttpOnly cookie, or returns null. */
    private String extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("ll_jwt".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
