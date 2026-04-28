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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
                OrderStatus.PENDING,
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
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getMyOrdersPaged(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageRequest)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAllOrdersPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findAllByOrderByCreatedAtDesc(pageRequest)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByPublicId(UUID publicId, String userEmail, boolean canViewAll) {
        Order order = findByPublicIdOrThrow(publicId);

        if (!canViewAll && !order.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderDto.OrderResponse updateStatus(UUID publicId, OrderStatus newStatus) {
        Order order = findByPublicIdOrThrow(publicId);
        order.setOrderStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private Order findByPublicIdOrThrow(UUID publicId) {
        return orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + publicId));
    }

    private OrderDto.OrderResponse toResponse(Order order) {
        OrderDto.OrderResponse response = new OrderDto.OrderResponse();
        response.setPublicId(order.getPublicId());
        response.setServiceTypeName(order.getServiceType().getName());
        response.setAddressCity(order.getAddress().getCity());
        response.setPickupTime(order.getPickupTime());
        response.setOrderStatus(order.getOrderStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setSpecialInstructions(order.getSpecialInstructions());
        response.setCreatedAt(order.getCreatedAt());
        return response;
    }
}
