package com.latherline.service;

import com.latherline.entity.SubscriptionPlan;
import com.latherline.entity.User;
import com.latherline.entity.UserSubscription;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.SubscriptionPlanRepository;
import com.latherline.repository.UserRepository;
import com.latherline.repository.UserSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private UserSubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        return planRepository.save(plan);
    }

    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<SubscriptionPlan> getActivePlans(Long businessId) {
        return planRepository.findByBusinessIdAndIsActiveTrue(businessId);
    }

    @Transactional
    public UserSubscription subscribeUser(String userEmail, Long planId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        Optional<UserSubscription> existingOpt = subscriptionRepository.findByUserIdAndStatus(user.getId(), "ACTIVE");
        if (existingOpt.isPresent()) {
            throw new IllegalStateException("User already has an active subscription");
        }

        UserSubscription sub = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .status("ACTIVE")
                .currentPeriodEnd(LocalDateTime.now().plusMonths(1))
                .remainingKg(plan.getIncludedKg())
                .remainingPieces(plan.getIncludedPieces())
                .stripeSubscriptionId("mock_sub_" + System.currentTimeMillis())
                .build();

        return subscriptionRepository.save(sub);
    }

    public Optional<UserSubscription> getActiveSubscription(Long userId) {
        Optional<UserSubscription> subOpt = subscriptionRepository.findByUserIdAndStatus(userId, "ACTIVE");
        if (subOpt.isPresent()) {
            UserSubscription sub = subOpt.get();
            if (sub.getCurrentPeriodEnd().isBefore(LocalDateTime.now())) {
                sub.setStatus("EXPIRED");
                subscriptionRepository.save(sub);
                return Optional.empty();
            }
            return Optional.of(sub);
        }
        return Optional.empty();
    }
}
