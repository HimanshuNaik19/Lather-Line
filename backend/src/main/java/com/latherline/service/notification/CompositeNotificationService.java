package com.latherline.service.notification;

import com.latherline.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Primary
@Service
@RequiredArgsConstructor
public class CompositeNotificationService implements NotificationService {

    private final EmailNotificationService emailNotificationService;
    private final SmsNotificationService smsNotificationService;

    @Async
    @Override
    public void sendOrderStatusNotification(Order order) {
        log.info("Sending notifications for order {} (Status: {})", order.getPublicId(), order.getOrderStatus());
        
        try {
            emailNotificationService.sendOrderStatusNotification(order);
        } catch (Exception e) {
            log.error("Error in email notification fallback: {}", e.getMessage());
        }

        try {
            smsNotificationService.sendOrderStatusNotification(order);
        } catch (Exception e) {
            log.error("Error in SMS notification fallback: {}", e.getMessage());
        }
    }
}
