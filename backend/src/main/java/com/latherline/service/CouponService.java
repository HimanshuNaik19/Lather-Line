package com.latherline.service;

import com.latherline.entity.Coupon;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public void deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    public Optional<Coupon> validateCoupon(String code, Long businessId) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndBusinessId(code, businessId);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            if (!coupon.getIsActive()) {
                return Optional.empty();
            }
            if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(LocalDateTime.now())) {
                return Optional.empty();
            }
            return Optional.of(coupon);
        }
        return Optional.empty();
    }
}
