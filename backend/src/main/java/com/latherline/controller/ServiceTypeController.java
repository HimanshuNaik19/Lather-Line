package com.latherline.controller;

import com.latherline.entity.ServiceType;
import com.latherline.exception.ResourceNotFoundException;
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

    /** Admin only — list all services (active + inactive) */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceType>> listAll() {
        return ResponseEntity.ok(serviceTypeRepository.findAll());
    }

    /** Admin only — seed / create a new service type */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceType> create(@RequestBody ServiceType serviceType) {
        return ResponseEntity.status(201).body(serviceTypeRepository.save(serviceType));
    }

    /** Admin only — update an existing service */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceType> update(@PathVariable Long id, @RequestBody ServiceType payload) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        serviceType.setName(payload.getName());
        serviceType.setDescription(payload.getDescription());
        serviceType.setPricePerUnit(payload.getPricePerUnit());
        serviceType.setActive(payload.getActive());
        return ResponseEntity.ok(serviceTypeRepository.save(serviceType));
    }

    /** Admin only — delete an existing service */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!serviceTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found: " + id);
        }
        serviceTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
