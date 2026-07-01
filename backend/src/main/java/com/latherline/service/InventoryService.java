package com.latherline.service;

import com.latherline.entity.InventoryItem;
import com.latherline.entity.ServiceInventoryRequirement;
import com.latherline.entity.ServiceType;
import com.latherline.repository.InventoryItemRepository;
import com.latherline.repository.ServiceInventoryRequirementRepository;
import com.latherline.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ServiceInventoryRequirementRepository requirementRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public List<InventoryItem> getInventoryItems(Long businessId) {
        return inventoryItemRepository.findByBusinessId(businessId);
    }

    @Transactional
    public InventoryItem createInventoryItem(Long businessId, InventoryItem item) {
        item.setBusinessId(businessId);
        if (item.getQuantityInStock() == null) item.setQuantityInStock(BigDecimal.ZERO);
        if (item.getCostPerUnit() == null) item.setCostPerUnit(BigDecimal.ZERO);
        if (item.getLowStockThreshold() == null) item.setLowStockThreshold(BigDecimal.ZERO);
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryItem updateInventoryItem(Long businessId, Long id, InventoryItem updates) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        if (!item.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }
        item.setName(updates.getName());
        item.setUnit(updates.getUnit());
        item.setQuantityInStock(updates.getQuantityInStock());
        item.setCostPerUnit(updates.getCostPerUnit());
        item.setLowStockThreshold(updates.getLowStockThreshold());
        return inventoryItemRepository.save(item);
    }

    public List<ServiceInventoryRequirement> getRequirementsForService(Long serviceTypeId) {
        return requirementRepository.findByServiceTypeId(serviceTypeId);
    }

    @Transactional
    public ServiceInventoryRequirement addRequirement(Long businessId, Long serviceTypeId, Long inventoryItemId, BigDecimal quantityRequired) {
        ServiceType serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new RuntimeException("Service Type not found"));
        
        if (!serviceType.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        InventoryItem inventoryItem = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (!inventoryItem.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        ServiceInventoryRequirement req = new ServiceInventoryRequirement();
        req.setServiceType(serviceType);
        req.setInventoryItem(inventoryItem);
        req.setQuantityRequired(quantityRequired);

        return requirementRepository.save(req);
    }
}
