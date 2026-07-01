package com.latherline.controller;

import com.latherline.entity.Coupon;
import com.latherline.entity.User;
import com.latherline.exception.UnauthorizedException;
import com.latherline.repository.UserRepository;
import com.latherline.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Optional<Coupon> couponOpt = couponService.validateCoupon(code, user.getBusinessId());
        
        if (couponOpt.isPresent()) {
            return ResponseEntity.ok(couponOpt.get());
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired coupon code");
        }
    }
}
