package com.latherline.service;

import com.latherline.config.JwtUtil;
import com.latherline.config.tenant.TenantContextHolder;
import com.latherline.dto.AuthDto;
import com.latherline.entity.Business;
import com.latherline.entity.User;
import com.latherline.enums.UserRole;
import com.latherline.exception.ConflictException;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.BusinessRepository;
import com.latherline.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BusinessRepository businessRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private TransactionTemplate transactionTemplate;
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Registration — resolves the business, then runs the user creation
     * in a programmatic transaction with the correct tenant context.
     *
     * Hibernate's @TenantId is resolved when the Session opens, so we
     * must set TenantContextHolder BEFORE any EntityManager/Session
     * interaction. Using TransactionTemplate ensures a fresh Session
     * opens after we set the correct tenant.
     */
    public AuthDto.AuthSession register(AuthDto.RegisterRequest request) {
        // Normalize the invite code: lowercase, trimmed
        String code = request.getBusinessCode().trim().toLowerCase();

        // Look up business by invite code — must be active
        // Business has NO @TenantId, so this query is cross-tenant safe.
        Business business = businessRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> {
                    boolean exists = businessRepository.findByCode(code).isPresent();
                    if (exists) {
                        return new ResourceNotFoundException(
                                "Business '" + code + "' is no longer accepting new registrations.");
                    }
                    return new ResourceNotFoundException(
                            "Invalid invite code: '" + code + "'. Please ask your business owner for the correct code.");
                });

        // Switch tenant context BEFORE the transaction opens a new Hibernate Session
        Long previousTenant = TenantContextHolder.getTenantId();
        TenantContextHolder.setTenantId(business.getId());
        try {
            return transactionTemplate.execute(status -> {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new ConflictException("Email already registered: " + request.getEmail());
                }

                User user = new User(
                        business.getId(),
                        request.getEmail(),
                        passwordEncoder.encode(request.getPassword()),
                        UserRole.CUSTOMER,
                        request.getPhone(),
                        request.getFullName()
                );

                userRepository.save(user);

                Map<String, Object> claims = Map.of("businessId", business.getId());
                String token = jwtUtil.generateToken(claims, toUserDetails(user));
                return new AuthDto.AuthSession(token, toAuthResponse(user));
            });
        } finally {
            if (previousTenant != null) {
                TenantContextHolder.setTenantId(previousTenant);
            } else {
                TenantContextHolder.clear();
            }
        }
    }

    public AuthDto.AuthSession registerBusiness(AuthDto.RegisterBusinessRequest request) {
        // Normalize code
        String code = request.getBusinessCode().trim().toLowerCase().replaceAll("\\s+", "-");

        // Ensure code is unique
        if (businessRepository.findByCode(code).isPresent()) {
            throw new ConflictException("Business code '" + code + "' is already taken. Please choose another.");
        }

        // Create the new business
        Business business = new Business(
                request.getBusinessName().trim(),
                code,
                request.getContactEmail() != null ? request.getContactEmail() : request.getEmail(),
                request.getPhone(),
                request.getAddressText(),
                true
        );
        business = businessRepository.save(business);

        // Now create the ADMIN user under this business
        final Long businessId = business.getId();
        TenantContextHolder.setTenantId(businessId);
        try {
            return transactionTemplate.execute(status -> {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new ConflictException("Email already registered: " + request.getEmail());
                }

                User user = new User(
                        businessId,
                        request.getEmail(),
                        passwordEncoder.encode(request.getPassword()),
                        UserRole.ADMIN,
                        request.getPhone(),
                        request.getFullName()
                );

                userRepository.save(user);

                Map<String, Object> claims = Map.of("businessId", businessId);
                String token = jwtUtil.generateToken(claims, toUserDetails(user));
                return new AuthDto.AuthSession(token, toAuthResponse(user));
            });
        } finally {
            TenantContextHolder.clear();
        }
    }

    @Transactional(readOnly = true)
    public AuthDto.AuthSession login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Map<String, Object> claims = Map.of("businessId", user.getBusinessId());
        String token = jwtUtil.generateToken(claims, toUserDetails(user));
        return new AuthDto.AuthSession(token, toAuthResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthDto.AuthResponse getCurrentUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return toAuthResponse(user);
    }

    private org.springframework.security.core.userdetails.UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }

    private AuthDto.AuthResponse toAuthResponse(User user) {
        return new AuthDto.AuthResponse(
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getBusinessId(),
                user.getPhone()
        );
    }
}
