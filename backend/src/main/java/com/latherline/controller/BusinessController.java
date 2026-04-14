package com.latherline.controller;

import com.latherline.entity.Business;
import com.latherline.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    @Autowired
    private BusinessRepository businessRepository;

    /** Public endpoint to fetch all active businesses for storefront selector */
    @GetMapping
    public ResponseEntity<List<Business>> getActiveBusinesses() {
        return ResponseEntity.ok(businessRepository.findByActiveTrue());
    }

    // In a full SaaS scenario, there would be a Super-Admin endpoint here
    // to onboard new businesses and create their ADMIN accounts.
}
