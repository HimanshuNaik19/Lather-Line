package com.latherline.controller;

import com.latherline.dto.SubscriptionDto;
import com.latherline.entity.SubscriptionPlan;
import com.latherline.entity.User;
import com.latherline.entity.UserSubscription;
import com.latherline.exception.UnauthorizedException;
import com.latherline.repository.UserRepository;
import com.latherline.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/plans")
    public List<SubscriptionPlan> getActivePlans(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return subscriptionService.getActivePlans(user.getBusinessId());
    }

    @PostMapping("/subscribe/{planId}")
    public ResponseEntity<?> subscribe(@PathVariable Long planId, Authentication auth) {
        try {
            UserSubscription sub = subscriptionService.subscribeUser(auth.getName(), planId);
            return ResponseEntity.ok(toResponse(sub));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMySubscription(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        Optional<UserSubscription> sub = subscriptionService.getActiveSubscription(user.getId());
        if (sub.isPresent()) {
            return ResponseEntity.ok(toResponse(sub.get()));
        }
        return ResponseEntity.notFound().build();
    }

    private SubscriptionDto.UserSubscriptionResponse toResponse(UserSubscription sub) {
        SubscriptionDto.PlanResponse plan = new SubscriptionDto.PlanResponse();
        plan.setId(sub.getPlan().getId());
        plan.setName(sub.getPlan().getName());
        plan.setPrice(sub.getPlan().getPrice());
        plan.setIncludedKg(sub.getPlan().getIncludedKg());
        plan.setIncludedPieces(sub.getPlan().getIncludedPieces());
        plan.setIsActive(sub.getPlan().getIsActive());

        SubscriptionDto.UserSubscriptionResponse response = new SubscriptionDto.UserSubscriptionResponse();
        response.setId(sub.getId());
        response.setPlan(plan);
        response.setStatus(sub.getStatus());
        response.setCurrentPeriodEnd(sub.getCurrentPeriodEnd());
        response.setRemainingKg(sub.getRemainingKg());
        response.setRemainingPieces(sub.getRemainingPieces());
        return response;
    }
}
