package com.latherline.controller;

import com.latherline.dto.ChatDto;
import com.latherline.service.ChatService;
import com.latherline.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private RateLimiterService rateLimiterService;

    /**
     * POST /api/chat
     * Body: { "message": "How do I schedule a pickup?" }
     * Returns: { "reply": "...", "sender": "bot" }
     *
     * Rate limit: 5 requests per minute per IP.
     * Returns HTTP 429 Too Many Requests when limit is exceeded.
     */
    @PostMapping
    public ResponseEntity<?> chat(
            @RequestBody ChatDto.ChatRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = resolveClientIp(httpRequest);

        if (!rateLimiterService.tryConsume(clientIp)) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "status", 429,
                            "error", "Too Many Requests",
                            "message", "Chatbot limit reached: 5 messages per minute. Please wait before trying again."
                    ));
        }

        return ResponseEntity.ok(chatService.respond(request));
    }

    /** Respect X-Forwarded-For header when behind a reverse proxy */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
