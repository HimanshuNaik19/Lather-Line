package com.latherline.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtUtil.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Extract businessId for Multi-Tenancy
                    Long businessId = jwtUtil.extractClaim(jwt, claims -> claims.get("businessId", Long.class));
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
}
