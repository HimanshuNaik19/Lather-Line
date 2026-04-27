package com.latherline.service;

import com.latherline.dto.OrderDto;
import com.latherline.entity.Address;
import com.latherline.entity.Order;
import com.latherline.entity.ServiceType;
import com.latherline.entity.User;
import com.latherline.enums.OrderStatus;
import com.latherline.exception.ResourceNotFoundException;
import com.latherline.exception.UnauthorizedException;
import com.latherline.repository.AddressRepository;
import com.latherline.repository.OrderRepository;
import com.latherline.repository.ServiceTypeRepository;
import com.latherline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Transactional
    public OrderDto.OrderResponse createOrder(String userEmail, OrderDto.CreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ServiceType serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found: " + request.getServiceTypeId()));

        // Explicitly carry the tenant ID so @TenantId fields are never null on INSERT
        Long tenantId = user.getBusinessId();

        Address address = new Address(
                tenantId,
                user,
                request.getStreet(),
                request.getCity(),
                request.getState(),
                request.getPinCode(),
                true
        );
        address = addressRepository.save(address);

        Order order = new Order(
                tenantId,
                user,
                serviceType,
                address,
                request.getPickupTime(),
                com.latherline.enums.OrderStatus.PENDING,
                request.getTotalAmount(),
                request.getSpecialInstructions()
        );

        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Paginated version — used by GET /api/orders?page=0&size=10 */
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getMyOrdersPaged(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pr)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Paginated version — used by GET /api/orders/all?page=0&size=20 */
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAllOrdersPaged(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findAllByOrderByCreatedAtDesc(pr).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderById(Long orderId, String userEmail, boolean canViewAll) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // CUSTOMER can only see their own; ADMIN/WASHER can see all
        if (!canViewAll && !order.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderDto.OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        order.setOrderStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private OrderDto.OrderResponse toResponse(Order order) {
        OrderDto.OrderResponse res = new OrderDto.OrderResponse();
        res.setId(order.getId());
        res.setPublicId(order.getPublicId());
        res.setServiceTypeName(order.getServiceType().getName());
        res.setAddressCity(order.getAddress().getCity());
        res.setPickupTime(order.getPickupTime());
        res.setOrderStatus(order.getOrderStatus());
        res.setTotalAmount(order.getTotalAmount());
        res.setSpecialInstructions(order.getSpecialInstructions());
        res.setCreatedAt(order.getCreatedAt());
        return res;
    }
}
