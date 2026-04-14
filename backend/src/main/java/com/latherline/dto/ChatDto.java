package com.latherline.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ChatDto {

    @Data
    public static class ChatRequest {
        private String message;

        public ChatRequest() {
            
        }

        public ChatRequest(String message) {
            this.message = message;
        }
    }

    @Data
    public static class ChatResponse {
        private String reply;
        private String sender;  // "bot"
    

        public ChatResponse() {
        
        }

        public ChatResponse(String reply, String sender) {
        this.reply = reply;
        this.sender = sender;
        }
    }
}
