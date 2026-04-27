package com.latherline.service;

import com.latherline.config.JwtUtil;
import com.latherline.dto.AuthDto;
import com.latherline.entity.Business;
import com.latherline.entity.User;
import com.latherline.enums.UserRole;
import com.latherline.exception.ConflictException;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.BusinessRepository;
import com.latherline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public AuthDto.AuthSession register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        // Look up business by invite code
        Business business = businessRepository.findByCode(request.getBusinessCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invalid business code: '" + request.getBusinessCode() + "'. Please ask your business owner for the correct invite code."));

        User user = User.builder()
                .businessId(business.getId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.CUSTOMER)
                .build();

        userRepository.save(user);

        Map<String, Object> claims = Map.of("businessId", business.getId());
        String token = jwtUtil.generateToken(claims, toUserDetails(user));
        return new AuthDto.AuthSession(token, toAuthResponse(user));
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
                user.getRole().name()
        );
    }
}
