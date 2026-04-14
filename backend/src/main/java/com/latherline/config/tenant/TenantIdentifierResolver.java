package com.latherline.config.tenant;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<Long> {

    @Override
    public Long resolveCurrentTenantIdentifier() {
        Long tenantId = TenantContextHolder.getTenantId();
        return tenantId != null ? tenantId : 1L; // Default to business 1
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
