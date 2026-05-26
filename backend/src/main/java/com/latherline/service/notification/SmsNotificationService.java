package com.latherline.service.notification;

import com.latherline.config.TwilioConfig;
import com.latherline.entity.Order;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class SmsNotificationService implements NotificationService {

    private final TwilioConfig twilioConfig;
    private boolean isTwilioReady = false;

    public SmsNotificationService(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    @PostConstruct
    public void init() {
        if (twilioConfig.isConfigured()) {
            Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
            isTwilioReady = true;
            log.info("Twilio SDK initialized with provided credentials.");
        } else {
            log.warn("Twilio credentials not fully configured. Falling back to MOCK SMS logger.");
        }
    }

    @Override
    public void sendOrderStatusNotification(Order order) {
        String toPhone = order.getUser().getPhone();
        if (toPhone == null || toPhone.isBlank()) {
            log.warn("Cannot send SMS: customer phone is missing for order {}", order.getPublicId());
            return;
        }

        // Add country code if missing (naive approach for India default)
        if (!toPhone.startsWith("+")) {
            toPhone = "+91" + toPhone;
        }

        String body = String.format(
                "Lather & Line: Hi %s, your order #%s is now %s. Total: ₹%s",
                order.getUser().getFullName(),
                order.getPublicId().toString().substring(0, 8).toUpperCase(),
                order.getOrderStatus().toString().replace("_", " "),
                order.getTotalAmount()
        );

        if (!isTwilioReady) {
            log.info("📱 [MOCK SMS] To: {} | Body: {}", toPhone, body);
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    body
            ).create();
            log.info("📱 SMS sent to {} for order {} (SID: {})", toPhone, order.getPublicId(), message.getSid());
        } catch (Exception e) {
            log.error("❌ Failed to send SMS to {} for order {}: {}", toPhone, order.getPublicId(), e.getMessage());
        }
    }
}
