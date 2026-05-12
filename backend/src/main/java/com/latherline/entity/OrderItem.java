package com.latherline.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    /** Quantity in KG (e.g. 2.5) or in pieces (e.g. 3) */
    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    /** Snapshot of pricePerUnit at order creation time — immune to future price changes */
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /** Server-computed: quantity × unitPrice */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /** Optional garment label, e.g. "Shirt", "Pants", "Saree" */
    @Column(length = 100)
    private String label;

    public OrderItem() {}

    public OrderItem(Order order, ServiceType serviceType, BigDecimal quantity, BigDecimal unitPrice, BigDecimal subtotal, String label) {
        this.order = order;
        this.serviceType = serviceType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.label = label;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
