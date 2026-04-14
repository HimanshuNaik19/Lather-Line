package com.latherline.service;

import com.latherline.dto.ChatDto;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * ChatService — currently rule-based (keyword matching).
 * Swap the respond() method body for a real LLM call (Gemini / OpenAI)
 * when you wire up an API key via environment variable.
 */
@Service
public class ChatService {

    private static final Map<String, String> FAQ = Map.of(
            "schedule",   "To schedule a pickup, go to the Dashboard → New Order, choose your service type, set the pickup time, and confirm!",
            "pickup",     "We pick up from your registered address. Pickups are available daily from 8 AM to 8 PM.",
            "service",    "We offer Wash & Fold (₹49/kg), Dry Cleaning (₹199/garment), Steam Ironing (₹29/piece), and Premium Laundry (₹79/kg).",
            "price",      "Our prices start at ₹29 for ironing, ₹49/kg for Wash & Fold, and ₹199/garment for Dry Cleaning.",
            "time",       "Standard orders are typically delivered in 48 hours. Express 24-hour service is available for an extra fee.",
            "track",      "You can track your order in real-time on the Orders page. Status updates: PENDING → PICKED_UP → IN_PROGRESS → READY → DELIVERED.",
            "cancel",     "You can cancel an order within 30 minutes of placing it. Contact support for help.",
            "contact",    "Reach us at support@latherline.com or call +91-9876543210 (Mon–Sat, 9 AM–6 PM).",
            "payment",    "We accept UPI, credit/debit cards, and cash on pickup. Payment is collected at the time of delivery."
    );

    public ChatDto.ChatResponse respond(ChatDto.ChatRequest request) {
        String msg = request.getMessage().toLowerCase();

        String reply = FAQ.entrySet().stream()
                .filter(entry -> msg.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("I'm here to help! You can ask me about scheduling, pricing, service types, order tracking, or cancellations. 😊");

        return new ChatDto.ChatResponse(reply, "bot");
    }
}
