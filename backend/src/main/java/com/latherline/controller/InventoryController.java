package com.latherline.controller;

import com.latherline.entity.InventoryItem;
import com.latherline.entity.ServiceInventoryRequirement;
import com.latherline.entity.User;
import com.latherline.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.latherline.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getInventoryItems(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(inventoryService.getInventoryItems(user.getBusinessId()));
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createInventoryItem(@AuthenticationPrincipal UserDetails userDetails, @RequestBody InventoryItem item) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(inventoryService.createInventoryItem(user.getBusinessId(), item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateInventoryItem(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id, @RequestBody InventoryItem item) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(inventoryService.updateInventoryItem(user.getBusinessId(), id, item));
    }

    @GetMapping("/services/{serviceTypeId}")
    public ResponseEntity<List<ServiceInventoryRequirement>> getRequirements(@PathVariable Long serviceTypeId) {
        return ResponseEntity.ok(inventoryService.getRequirementsForService(serviceTypeId));
    }

    @PostMapping("/services/{serviceTypeId}")
    public ResponseEntity<ServiceInventoryRequirement> addRequirement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long serviceTypeId,
            @RequestBody Map<String, Object> payload) {
        
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long inventoryItemId = ((Number) payload.get("inventoryItemId")).longValue();
        BigDecimal quantityRequired = new BigDecimal(payload.get("quantityRequired").toString());
        
        return ResponseEntity.ok(inventoryService.addRequirement(user.getBusinessId(), serviceTypeId, inventoryItemId, quantityRequired));
    }
}
