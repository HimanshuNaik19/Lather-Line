package com.latherline.repository;

import com.latherline.entity.ServiceInventoryRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceInventoryRequirementRepository extends JpaRepository<ServiceInventoryRequirement, Long> {
    List<ServiceInventoryRequirement> findByServiceTypeId(Long serviceTypeId);
    List<ServiceInventoryRequirement> findByServiceTypeIdIn(List<Long> serviceTypeIds);
}
