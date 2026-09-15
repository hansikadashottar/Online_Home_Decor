package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.CreateOrderRequest;
import com.homedecor.onlinehomedecor.dto.OrderResponse;
import com.homedecor.onlinehomedecor.dto.UpdateOrderStatusRequest;
import com.homedecor.onlinehomedecor.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 1. PLACE ORDER
    @PostMapping
    public ResponseEntity<String> placeOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        // 1. Get logged-in user's email
        String email = authentication.getName();

        // 2. Place order
        orderService.placeOrder(
                email,
                request
        );

        // 3. Return success response
        return ResponseEntity.ok(
                "Order placed successfully"
        );
    }

    // 2. GET CUSTOMER ORDER HISTORY
    @GetMapping
    public List<OrderResponse> getOrders(
            Authentication authentication) {

        String email = authentication.getName();

        return orderService.getOrdersByEmail(email);
    }

    // 3. GET SINGLE CUSTOMER ORDER
    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        String email = authentication.getName();

        return orderService.getOrderById(
                email,
                orderId
        );
    }

    // 4. ADMIN - GET ALL ORDERS
    @GetMapping("/admin/all")
    public List<OrderResponse> getAllOrders() {

        return orderService.getAllOrders();
    }

    // 5. ADMIN - GET SINGLE ORDER
    @GetMapping("/admin/{orderId}")
    public OrderResponse getOrderByIdForAdmin(
            @PathVariable Long orderId) {

        return orderService.getOrderByIdForAdmin(
                orderId
        );
    }

    // 6. ADMIN - UPDATE ORDER STATUS
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        orderService.updateOrderStatus(
                orderId,
                request.getStatus()
        );

        return ResponseEntity.ok(
                "Order status updated successfully"
        );
    }

    // 7. CUSTOMER - CANCEL OWN ORDER
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId) {

        String email = authentication.getName();

        orderService.cancelOrder(
                email,
                orderId
        );

        return ResponseEntity.ok(
                "Order cancelled successfully"
        );
    }
}