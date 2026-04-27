package com.latherline.controller;

import com.latherline.entity.ServiceType;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceTypeController {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    /**
     * Public — list all active services for the booking form.
     * Result is cached so repeated calls don't hit the database.
     * Cache key includes the tenant ID automatically via Hibernate's filter.
     */
    @GetMapping
    @Cacheable("services")
    public ResponseEntity<List<ServiceType>> listActive() {
        return ResponseEntity.ok(serviceTypeRepository.findByActiveTrue());
    }

    /** Admin only — list all services (active + inactive) */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceType>> listAll() {
        return ResponseEntity.ok(serviceTypeRepository.findAll());
    }

    /** Admin only — create a new service type; evicts the services cache */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<ServiceType> create(@RequestBody ServiceType serviceType) {
        return ResponseEntity.status(201).body(serviceTypeRepository.save(serviceType));
    }

    /** Admin only — update an existing service; evicts the services cache */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<ServiceType> update(@PathVariable Long id, @RequestBody ServiceType payload) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        serviceType.setName(payload.getName());
        serviceType.setDescription(payload.getDescription());
        serviceType.setPricePerUnit(payload.getPricePerUnit());
        serviceType.setActive(payload.getActive());
        return ResponseEntity.ok(serviceTypeRepository.save(serviceType));
    }

    /** Admin only — delete a service; evicts the services cache */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!serviceTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found: " + id);
        }
        serviceTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
