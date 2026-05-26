package com.latherline.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.stripe")
public class StripeConfig {
    private String apiKey;
    private String webhookSecret;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
