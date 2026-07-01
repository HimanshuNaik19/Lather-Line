package com.latherline.service;

import com.latherline.dto.OrderDto;
import com.latherline.entity.Address;
import com.latherline.entity.Order;
import com.latherline.entity.OrderItem;
import com.latherline.entity.ServiceType;
import com.latherline.entity.User;
import com.latherline.enums.OrderStatus;
import com.latherline.enums.PaymentStatus;
import com.latherline.enums.UserRole;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.exception.UnauthorizedException;
import com.latherline.repository.AddressRepository;
import com.latherline.repository.CouponRepository;
import com.latherline.repository.OrderRepository;
import com.latherline.repository.ServiceTypeRepository;
import com.latherline.repository.UserRepository;
import com.latherline.repository.UserSubscriptionRepository;
import com.latherline.repository.InventoryItemRepository;
import com.latherline.repository.ServiceInventoryRequirementRepository;
import com.latherline.entity.Coupon;
import com.latherline.entity.UserSubscription;
import com.latherline.entity.InventoryItem;
import com.latherline.entity.ServiceInventoryRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private UserSubscriptionRepository subscriptionRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;
    @Autowired private ServiceInventoryRequirementRepository requirementRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private com.latherline.service.notification.NotificationService notificationService;

    // ── Create online order (customer) ────────────────────────────────────────
    @Transactional
    public OrderDto.OrderResponse createOrder(String userEmail, OrderDto.CreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long tenantId = user.getBusinessId();

        Address address = addressRepository.save(new Address(
                tenantId, user,
                request.getStreet(), request.getCity(), request.getState(), request.getPinCode(), true
        ));

        // Build order shell — total computed below
        Order order = new Order(tenantId, user, address, request.getPickupTime(),
                OrderStatus.PENDING, BigDecimal.ZERO, request.getSpecialInstructions());
        
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING); // Online or Pay Later always start as PENDING

        // Resolve items and compute total server-side
        List<OrderItem> items = buildItems(order, request.getItems(), user);
        BigDecimal subtotal = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setItems(items);
        order.setSubtotalAmount(subtotal);

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndBusinessId(request.getCouponCode(), tenantId);
            if (couponOpt.isPresent() && couponOpt.get().getIsActive() && 
               (couponOpt.get().getValidUntil() == null || couponOpt.get().getValidUntil().isAfter(LocalDateTime.now()))) {
                Coupon coupon = couponOpt.get();
                order.setCoupon(coupon);
                discount = subtotal.multiply(coupon.getDiscountPercentage()).divide(new BigDecimal("100"));
                if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
            }
        }
        order.setDiscountAmount(discount);
        order.setTotalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO));

        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    // ── Create walk-in POS order (admin / manager / washer) ──────────────────
    @Transactional
    public OrderDto.OrderResponse createPosOrder(String staffEmail, OrderDto.PosCreateRequest request) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new UnauthorizedException("Staff not found"));
        Long tenantId = staff.getBusinessId();

        // Find or auto-register the walk-in customer
        User customer = userRepository.findByPhone(request.getCustomerPhone())
                .orElseGet(() -> {
                    User u = new User();
                    u.setBusinessId(tenantId);
                    u.setEmail(request.getCustomerPhone() + ".b" + tenantId + "@walkin.local");
                    u.setFullName(request.getCustomerName());
                    u.setPhone(request.getCustomerPhone());
                    u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    u.setRole(UserRole.CUSTOMER);
                    return userRepository.save(u);
                });

        Address address = addressRepository.save(
                new Address(tenantId, customer, "Walk-in POS", "Store", "Store", "000000", false)
        );

        String notes = request.getSpecialInstructions() != null ? request.getSpecialInstructions() : "Walk-in POS Order";
        Order order = new Order(tenantId, customer, address, LocalDateTime.now(),
                OrderStatus.PENDING, BigDecimal.ZERO, notes);
        
        order.setPaymentMethod(com.latherline.enums.PaymentMethod.CASH);
        order.setPaymentStatus(PaymentStatus.PAID);

        List<OrderItem> items = buildItems(order, request.getItems(), customer);
        BigDecimal subtotal = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setItems(items);
        order.setSubtotalAmount(subtotal);
        
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndBusinessId(request.getCouponCode(), tenantId);
            if (couponOpt.isPresent() && couponOpt.get().getIsActive() && 
               (couponOpt.get().getValidUntil() == null || couponOpt.get().getValidUntil().isAfter(LocalDateTime.now()))) {
                Coupon coupon = couponOpt.get();
                order.setCoupon(coupon);
                discount = subtotal.multiply(coupon.getDiscountPercentage()).divide(new BigDecimal("100"));
                if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
            }
        }
        order.setDiscountAmount(discount);
        order.setTotalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO));

        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    // ── Shared item builder — resolves service types, snapshots prices ─────────
    private List<OrderItem> buildItems(Order order, List<OrderDto.OrderItemRequest> itemRequests, User user) {
        List<OrderItem> items = new ArrayList<>();
        
        Optional<UserSubscription> subOpt = subscriptionRepository.findByUserIdAndStatus(user.getId(), "ACTIVE");
        UserSubscription sub = subOpt.filter(s -> s.getCurrentPeriodEnd().isAfter(LocalDateTime.now())).orElse(null);

        for (OrderDto.OrderItemRequest req : itemRequests) {
            ServiceType svc = serviceTypeRepository.findById(req.getServiceTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service type not found: " + req.getServiceTypeId()));
            
            BigDecimal unitPrice = svc.getPricePerUnit();
            BigDecimal subtotal;
            
            BigDecimal qty = req.getQuantity();
            
            if (sub != null) {
                if ("KG".equalsIgnoreCase(svc.getUnit()) && sub.getRemainingKg() > 0) {
                    if (qty.intValue() <= sub.getRemainingKg()) {
                        sub.setRemainingKg(sub.getRemainingKg() - qty.intValue());
                        unitPrice = BigDecimal.ZERO;
                    } else {
                        // Partially covered by subscription
                        BigDecimal covered = new BigDecimal(sub.getRemainingKg());
                        sub.setRemainingKg(0);
                        // The rest is charged at full price, so average unit price is calculated or subtotal is direct
                        subtotal = (qty.subtract(covered)).multiply(unitPrice);
                        unitPrice = subtotal.divide(qty, 2, java.math.RoundingMode.HALF_UP);
                    }
                } else if ("PIECE".equalsIgnoreCase(svc.getUnit()) && sub.getRemainingPieces() > 0) {
                    if (qty.intValue() <= sub.getRemainingPieces()) {
                        sub.setRemainingPieces(sub.getRemainingPieces() - qty.intValue());
                        unitPrice = BigDecimal.ZERO;
                    } else {
                        BigDecimal covered = new BigDecimal(sub.getRemainingPieces());
                        sub.setRemainingPieces(0);
                        subtotal = (qty.subtract(covered)).multiply(unitPrice);
                        unitPrice = subtotal.divide(qty, 2, java.math.RoundingMode.HALF_UP);
                    }
                }
            }
            
            subtotal = unitPrice.multiply(qty);
            OrderItem item = new OrderItem(order, svc, qty, unitPrice, subtotal, req.getLabel());
            items.add(item);
        }
        
        if (sub != null) {
            subscriptionRepository.save(sub);
        }
        
        return items;
    }

    // ── Customer: own orders ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getMyOrdersPaged(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(this::toResponse);
    }

    // ── Admin/Manager/Washer: all orders ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAllOrdersPaged(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(this::toResponse);
    }

    // ── Washer: only actionable orders ───────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getActiveOrders() {
        return orderRepository.findByOrderStatusIn(
                List.of(OrderStatus.PENDING, OrderStatus.PICKED_UP, OrderStatus.IN_PROGRESS, OrderStatus.READY)
        ).stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Single order lookup ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByPublicId(UUID publicId, String userEmail, boolean canViewAll) {
        Order order = findByPublicIdOrThrow(publicId);
        if (!canViewAll && !order.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(order);
    }

    // ── Status update with WebSocket broadcast ────────────────────────────────
    @Transactional
    public OrderDto.OrderResponse updateStatus(UUID publicId, OrderStatus newStatus) {
        Order order = findByPublicIdOrThrow(publicId);
        
        // Auto-deduct inventory when status becomes IN_PROGRESS
        if (newStatus == OrderStatus.IN_PROGRESS && !order.isInventoryDeducted()) {
            deductInventoryForOrder(order);
            order.setInventoryDeducted(true);
        }

        order.setOrderStatus(newStatus);
        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);

        // Send notifications
        if (newStatus == OrderStatus.READY || newStatus == OrderStatus.DELIVERED) {
            notificationService.sendOrderStatusNotification(saved);
        }

        return response;
    }

    // ── Delete Order (Admin / Manager) ────────────────────────────────────────
    @Transactional
    public void deleteOrder(UUID publicId) {
        Order order = findByPublicIdOrThrow(publicId);
        orderRepository.delete(order);
    }

    // ── Inventory Auto-Deduction ──────────────────────────────────────────────
    private void deductInventoryForOrder(Order order) {
        BigDecimal totalCogs = BigDecimal.ZERO;
        
        for (OrderItem item : order.getItems()) {
            List<ServiceInventoryRequirement> requirements = requirementRepository.findByServiceTypeId(item.getServiceType().getId());
            for (ServiceInventoryRequirement req : requirements) {
                InventoryItem inventory = req.getInventoryItem();
                BigDecimal amountNeeded = req.getQuantityRequired().multiply(item.getQuantity());
                
                // Deduct from stock (allow negative to prevent blocking operations)
                inventory.setQuantityInStock(inventory.getQuantityInStock().subtract(amountNeeded));
                inventoryItemRepository.save(inventory);
                
                // Calculate COGS for this requirement
                BigDecimal cost = inventory.getCostPerUnit().multiply(amountNeeded);
                totalCogs = totalCogs.add(cost);
            }
        }
        order.setCogs(totalCogs);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    private void broadcastOrderUpdate(Order order, OrderDto.OrderResponse response) {
        String topic = "/topic/tenant/" + order.getBusinessId() + "/orders";
        messagingTemplate.convertAndSend(topic, java.util.Map.of("status", "updated", "publicId", order.getPublicId()));
    }

    private Order findByPublicIdOrThrow(UUID publicId) {
        return orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + publicId));
    }

    private OrderDto.OrderResponse toResponse(Order order) {
        OrderDto.OrderResponse r = new OrderDto.OrderResponse();
        r.setPublicId(order.getPublicId());
        r.setCustomerName(order.getUser().getFullName());
        r.setCustomerPhone(order.getUser().getPhone());
        r.setAddressCity(order.getAddress().getCity());
        r.setAddressStreet(order.getAddress().getStreet());
        r.setPickupTime(order.getPickupTime());
        r.setOrderStatus(order.getOrderStatus());
        r.setPaymentStatus(order.getPaymentStatus());
        r.setPaymentMethod(order.getPaymentMethod());
        r.setRazorpayOrderId(order.getRazorpayOrderId());
        r.setSubtotalAmount(order.getSubtotalAmount());
        r.setDiscountAmount(order.getDiscountAmount());
        r.setTotalAmount(order.getTotalAmount());
        if (order.getCoupon() != null) {
            r.setCouponCode(order.getCoupon().getCode());
        }
        r.setSpecialInstructions(order.getSpecialInstructions());
        r.setCreatedAt(order.getCreatedAt());
        r.setAddressLatitude(order.getAddress().getLatitude());
        r.setAddressLongitude(order.getAddress().getLongitude());

        if (order.getDriver() != null) {
            r.setDriverName(order.getDriver().getFullName());
            r.setDriverId(order.getDriver().getId());
        }

        // Map order items
        List<OrderDto.OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderDto.OrderItemResponse ir = new OrderDto.OrderItemResponse();
            ir.setServiceTypeId(item.getServiceType().getId());
            ir.setServiceName(item.getServiceType().getName());
            ir.setUnit(item.getServiceType().getUnit());
            ir.setQuantity(item.getQuantity());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setSubtotal(item.getSubtotal());
            ir.setLabel(item.getLabel());
            return ir;
        }).collect(Collectors.toList());

        r.setItems(itemResponses);
        return r;
    }

    // ── Driver delivery methods ───────────────────────────────────────────────
    @Transactional
    public OrderDto.OrderResponse assignDriver(UUID orderPublicId, Long driverId) {
        Order order = findByPublicIdOrThrow(orderPublicId);
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
        if (driver.getRole() != UserRole.DRIVER) {
            throw new IllegalStateException("User is not a driver.");
        }
        order.setDriver(driver);
        order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    @Transactional
    public OrderDto.OrderResponse claimDelivery(UUID orderPublicId, String driverEmail) {
        Order order = findByPublicIdOrThrow(orderPublicId);
        if (order.getDriver() != null) {
            throw new IllegalStateException("Order already assigned to a driver.");
        }
        if (order.getOrderStatus() != OrderStatus.READY) {
            throw new IllegalStateException("Order is not in READY status.");
        }
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        order.setDriver(driver);
        order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getDriverDeliveries(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        return orderRepository.findByDriverId(driver.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getAvailableDeliveries() {
        return orderRepository.findByOrderStatusAndDriverIsNull(OrderStatus.READY).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderDto.OrderResponse> getDrivers() {
        // Return all users with DRIVER role for admin assignment
        return List.of(); // placeholder - used only for driver list
    }
}
