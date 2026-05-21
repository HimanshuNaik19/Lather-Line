package com.latherline.service;

import com.latherline.dto.OrderDto;
import com.latherline.entity.Address;
import com.latherline.entity.Order;
import com.latherline.entity.OrderItem;
import com.latherline.entity.ServiceType;
import com.latherline.entity.User;
import com.latherline.enums.OrderStatus;
import com.latherline.enums.UserRole;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.exception.UnauthorizedException;
import com.latherline.repository.AddressRepository;
import com.latherline.repository.OrderRepository;
import com.latherline.repository.ServiceTypeRepository;
import com.latherline.repository.UserRepository;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private PasswordEncoder passwordEncoder;

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

        // Resolve items and compute total server-side
        List<OrderItem> items = buildItems(order, request.getItems());
        BigDecimal total = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setItems(items);
        order.setTotalAmount(total);

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

        List<OrderItem> items = buildItems(order, request.getItems());
        BigDecimal total = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setItems(items);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    // ── Shared item builder — resolves service types, snapshots prices ─────────
    private List<OrderItem> buildItems(Order order, List<OrderDto.OrderItemRequest> itemRequests) {
        List<OrderItem> items = new ArrayList<>();
        for (OrderDto.OrderItemRequest req : itemRequests) {
            ServiceType svc = serviceTypeRepository.findById(req.getServiceTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service type not found: " + req.getServiceTypeId()));
            BigDecimal unitPrice = svc.getPricePerUnit();
            BigDecimal subtotal  = unitPrice.multiply(req.getQuantity());
            OrderItem item = new OrderItem(order, svc, req.getQuantity(), unitPrice, subtotal, req.getLabel());
            items.add(item);
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
        order.setOrderStatus(newStatus);
        Order saved = orderRepository.save(order);
        OrderDto.OrderResponse response = toResponse(saved);
        broadcastOrderUpdate(saved, response);
        return response;
    }

    // ── Delete Order (Admin / Manager) ────────────────────────────────────────
    @Transactional
    public void deleteOrder(UUID publicId) {
        Order order = findByPublicIdOrThrow(publicId);
        orderRepository.delete(order);
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
        r.setTotalAmount(order.getTotalAmount());
        r.setSpecialInstructions(order.getSpecialInstructions());
        r.setCreatedAt(order.getCreatedAt());

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
}
