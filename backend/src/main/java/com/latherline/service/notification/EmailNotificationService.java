package com.latherline.service.notification;

import com.latherline.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.host:localhost}")
    private String mailHost;

    @Override
    public void sendOrderStatusNotification(Order order) {
        String toEmail = order.getUser().getEmail();
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send email: customer email is missing for order {}", order.getPublicId());
            return;
        }

        String subject = "Update on your order #" + order.getPublicId().toString().substring(0, 8).toUpperCase();
        String body = String.format(
                "Hi %s,\n\nYour laundry order is now: %s.\n\nTotal Amount: ₹%s\n\nThank you for choosing Lather & Line!",
                order.getUser().getFullName(),
                order.getOrderStatus().toString().replace("_", " "),
                order.getTotalAmount()
        );

        // If mail config is not fully set or is pointing to the unconfigured localhost, just mock log it.
        if (mailHost.equals("localhost") && fromEmail.isBlank()) {
            log.info("📧 [MOCK EMAIL] To: {} | Subject: {} | Body: {}", toEmail, subject, body.replace("\n", " "));
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail.isBlank() ? "no-reply@latherline.com" : fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("📧 Email sent to {} for order {}", toEmail, order.getPublicId());
        } catch (Exception e) {
            log.error("❌ Failed to send email to {} for order {}: {}", toEmail, order.getPublicId(), e.getMessage());
        }
    }
}
