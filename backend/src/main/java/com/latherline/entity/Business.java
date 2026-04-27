package com.latherline.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "businesses")
@Builder
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Subdomain or simple code e.g., 'sunshine'

    @Column(nullable = false)
    private String contactEmail;

    @Column
    private String contactPhone;

    @Column
    private String addressText;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    public Business() {
        
    }

    public Business(String name, String code, String contactEmail, String contactPhone, String addressText, Boolean active) {
        this.name = name;
        this.code = code;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.addressText = addressText;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddressText() {
        return addressText;
    }

    public void setAddressText(String addressText) {
        this.addressText = addressText;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
