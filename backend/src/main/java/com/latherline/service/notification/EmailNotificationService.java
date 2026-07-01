package com.latherline.service.notification;

import com.latherline.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Slf4j
@Service
public class EmailNotificationService implements NotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

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

        String orderId = order.getPublicId().toString().substring(0, 8).toUpperCase();
        String status = order.getOrderStatus().toString().replace("_", " ");
        String subject = "Lather & Line - Update on your order #" + orderId;
        
        String htmlBody = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #3b82f6; margin: 0;">Lather & Line</h2>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Premium Laundry & Dry Cleaning</p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #1e293b;">Hi %s,</h3>
                    <p style="color: #475569; font-size: 16px;">Your laundry order <strong>#%s</strong> is now:</p>
                    <div style="background-color: #3b82f6; color: white; padding: 12px; text-align: center; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 20px 0;">
                        %s
                    </div>
                    <p style="color: #475569; font-size: 16px;">Total Amount: <strong>₹%s</strong></p>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                    Thank you for choosing Lather & Line!<br>
                    <a href="https://latherline.com" style="color: #3b82f6; text-decoration: none;">Visit your dashboard</a>
                </p>
            </div>
            """, 
            order.getUser().getFullName(), 
            orderId, 
            status, 
            order.getTotalAmount()
        );

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null || (mailHost.equals("localhost") && fromEmail.isBlank())) {
            log.info("📧 [MOCK EMAIL] To: {} | Subject: {}", toEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail.isBlank() ? "no-reply@latherline.com" : fromEmail, "Lather & Line");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml

            mailSender.send(message);
            log.info("📧 HTML Email sent to {} for order {}", toEmail, order.getPublicId());
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to {} for order {}: {}", toEmail, order.getPublicId(), e.getMessage());
        }
    }
}
