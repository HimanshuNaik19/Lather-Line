package com.latherline.controller;

import com.latherline.entity.ServiceType;
import com.latherline.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceTypeController {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    /** Public — list all active services for the booking form */
    @GetMapping
    public ResponseEntity<List<ServiceType>> listActive() {
        return ResponseEntity.ok(serviceTypeRepository.findByActiveTrue());
    }

    /** Admin only — seed / create a new service type */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceType> create(@RequestBody ServiceType serviceType) {
        return ResponseEntity.status(201).body(serviceTypeRepository.save(serviceType));
    }
}
