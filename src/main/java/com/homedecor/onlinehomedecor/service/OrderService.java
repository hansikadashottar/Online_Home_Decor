package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.CreateOrderRequest;
import com.homedecor.onlinehomedecor.dto.OrderItemResponse;
import com.homedecor.onlinehomedecor.dto.OrderResponse;
import com.homedecor.onlinehomedecor.entity.*;
import com.homedecor.onlinehomedecor.exception.OrderNotFoundException;
import com.homedecor.onlinehomedecor.exception.UnauthorizedActionException;
import com.homedecor.onlinehomedecor.exception.UserNotFoundException;
import com.homedecor.onlinehomedecor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. PLACE / CREATE ORDER
    public OrderResponse placeOrder(
            String email,
            CreateOrderRequest request) {

        User user = userRepository.findByEmail(email);

        if (user == null) throw new UserNotFoundException("User not found");

        // 1. Validate shipping address
        if (request == null
                || request.getHouseFlat() == null
                || request.getHouseFlat().isBlank()
                || request.getArea() == null
                || request.getArea().isBlank()
                || request.getCity() == null
                || request.getCity().isBlank()
                || request.getState() == null
                || request.getState().isBlank()
                || request.getPincode() == null
                || request.getPincode().isBlank()) {

            throw new RuntimeException(
                    "Complete shipping address is required"
            );
        }

        // 2. Get customer's cart
        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // 3. Get all cart items
        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(
                        cart.getCartId()
                );

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 4. Check stock and calculate total amount
        double totalAmount = 0;

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (product.getStock() == null
                    || cartItem.getQuantity() > product.getStock()) {

                throw new RuntimeException(
                        product.getName()
                                + " does not have enough stock"
                );
            }
            if (product.getPrice() == null || product.getPrice() < 0) {
                throw new RuntimeException(
                        product.getName() + " has an invalid price"
                );
            }
            totalAmount +=
                    product.getPrice()
                            * cartItem.getQuantity();
        }

        // 5. Create main order
        Order order = new Order();

        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

        order.setHouseFlat(request.getHouseFlat());
        order.setArea(request.getArea());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPincode(request.getPincode());

        orderRepository.save(order);

        // 6. Create order items and update stock
        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            product.setStock(
                    product.getStock()
                            - cartItem.getQuantity()
            );

            productRepository.save(product);
        }

        // 7. Clear cart after successful order
        cartItemRepository.deleteAll(cartItems);

        return convertToResponse(order);
    }

    // 2. GET CUSTOMER ORDER HISTORY
    public List<OrderResponse> getOrdersByEmail(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) throw new UserNotFoundException("User not found");

        // 1. Fetch customer's latest orders first
        List<Order> orders =
                orderRepository
                        .findByUserEmailOrderByOrderDateDesc(email);

        return orders.stream()
                .map(this::convertToResponse)
                .toList();
    }

    // 3. GET SINGLE CUSTOMER ORDER
    public OrderResponse getOrderById(
            String email,
            Long orderId) {

        User user = userRepository.findByEmail(email);

        if (user == null) throw new UserNotFoundException("User not found");

        // 1. Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        // 2. Check order ownership
        if (!order.getUser()
                .getUserId()
                .equals(user.getUserId())) {

            throw new UnauthorizedActionException(
                    "Order does not belong to this user"
            );
        }

        return convertToResponse(order);
    }

    // 4. GET ALL ORDERS FOR ADMIN
    public List<OrderResponse> getAllOrders() {

        // 1. Fetch all orders latest first
        List<Order> orders =
                orderRepository.findAllByOrderByOrderDateDesc();

        return orders.stream()
                .map(this::convertToResponse)
                .toList();
    }

    // 5. ADMIN - GET SINGLE ORDER
    public OrderResponse getOrderByIdForAdmin(Long orderId) {

        // 1. Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        return convertToResponse(order);
    }

    // 6. ADMIN - UPDATE ORDER STATUS
    public OrderResponse updateOrderStatus(
            Long orderId,
            String status) {

        // 1. Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        // 2. Validate status
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Order status is required");
        }

        status = status.toUpperCase();

        String currentStatus = order.getStatus();

        // 3. PLACED can move to CONFIRMED or CANCELLED
        if (currentStatus.equals("PLACED")) {

            if (!status.equals("CONFIRMED")
                    && !status.equals("CANCELLED")) {

                throw new RuntimeException(
                        "Invalid order status change"
                );
            }

            // 4. CONFIRMED can move to DELIVERED or CANCELLED
        } else if (currentStatus.equals("CONFIRMED")) {

            if (!status.equals("DELIVERED")
                    && !status.equals("CANCELLED")) {

                throw new RuntimeException(
                        "Invalid order status change"
                );
            }

        } else {

            // 5. DELIVERED and CANCELLED are final states
            throw new RuntimeException(
                    "Order status cannot be changed"
            );
        }

        // 6. Restore stock when order is cancelled
        if (status.equals("CANCELLED")) {
            restoreStock(order);
        }

        order.setStatus(status);

        orderRepository.save(order);

        return convertToResponse(order);
    }

    // 7. CUSTOMER - CANCEL OWN ORDER
    public OrderResponse cancelOrder(
            String email,
            Long orderId) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // 1. Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        // 2. Check order ownership
        if (!order.getUser()
                .getUserId()
                .equals(user.getUserId())) {

            throw new UnauthorizedActionException(
                    "Order does not belong to this user"
            );
        }

        // 3. Customer can cancel only placed order
        if (!order.getStatus().equals("PLACED")) {

            throw new RuntimeException(
                    "Order is already cancelled and cannot be cancelled again"
            );
        }

        // 4. Restore product stock
        restoreStock(order);

        order.setStatus("CANCELLED");

        orderRepository.save(order);

        return convertToResponse(order);
    }

    // 8. RESTORE PRODUCT STOCK
    private void restoreStock(Order order) {

        if ("CANCELLED".equals(order.getStatus())) {
            return;
        }

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderOrderId(
                        order.getOrderId()
                );

        for (OrderItem orderItem : orderItems) {

            Product product = orderItem.getProduct();

            product.setStock(
                    product.getStock()
                            + orderItem.getQuantity()
            );

            productRepository.save(product);
        }
    }

    // 9. CONVERT ORDER ENTITY TO RESPONSE
    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setOrderId(order.getOrderId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());

        response.setHouseFlat(order.getHouseFlat());
        response.setArea(order.getArea());
        response.setCity(order.getCity());
        response.setState(order.getState());
        response.setPincode(order.getPincode());

        // 1. Fetch order items
        List<OrderItemResponse> itemResponses =
                orderItemRepository
                        .findByOrderOrderId(
                                order.getOrderId()
                        )
                        .stream()
                        .map(orderItem -> {

                            OrderItemResponse itemResponse =
                                    new OrderItemResponse();

                            Product product =
                                    orderItem.getProduct();

                            itemResponse.setOrderItemId(
                                    orderItem.getOrderItemId()
                            );

                            itemResponse.setProductId(
                                    product.getProductId()
                            );

                            itemResponse.setProductName(
                                    product.getName()
                            );

                            itemResponse.setQuantity(
                                    orderItem.getQuantity()
                            );

                            // 2. Use saved order price
                            itemResponse.setPrice(
                                    orderItem.getPrice()
                            );

                            itemResponse.setTotalPrice(
                                    orderItem.getPrice()
                                            * orderItem.getQuantity()
                            );

                            return itemResponse;
                        })
                        .toList();

        response.setItems(itemResponses);

        return response;
    }
}