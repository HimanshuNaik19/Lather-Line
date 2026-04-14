package com.latherline.controller;

import com.latherline.dto.ChatDto;
import com.latherline.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * POST /api/chat
     * Body: { "message": "How do I schedule a pickup?" }
     * Returns: { "reply": "...", "sender": "bot" }
     */
    @PostMapping
    public ResponseEntity<ChatDto.ChatResponse> chat(@RequestBody ChatDto.ChatRequest request) {
        return ResponseEntity.ok(chatService.respond(request));
    }
}
