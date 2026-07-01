package com.latherline.controller;

import com.latherline.entity.Coupon;
import com.latherline.entity.SubscriptionPlan;
import com.latherline.service.CouponService;
import com.latherline.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/marketing")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class MarketingController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private SubscriptionService subscriptionService;

    // --- Coupons ---

    @GetMapping("/coupons")
    public List<Coupon> getAllCoupons() {
        return couponService.getAllCoupons();
    }

    @PostMapping("/coupons")
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        return couponService.createCoupon(coupon);
    }

    @DeleteMapping("/coupons/{id}")
    public void deactivateCoupon(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
    }

    // --- Subscriptions ---

    @GetMapping("/plans")
    public List<SubscriptionPlan> getAllPlans() {
        return subscriptionService.getAllPlans();
    }

    @PostMapping("/plans")
    public SubscriptionPlan createPlan(@RequestBody SubscriptionPlan plan) {
        return subscriptionService.createPlan(plan);
    }
}
