package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.PaymentRequest;
import com.homedecor.onlinehomedecor.dto.PaymentResponse;
import com.homedecor.onlinehomedecor.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // 1. CREATE PAYMENT
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request) {

        String email = authentication.getName();

        PaymentResponse response =
                paymentService.createPayment(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
    // 2. VERIFY ONLINE PAYMENT
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            Authentication authentication,
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature) {

        String email = authentication.getName();

        PaymentResponse response =
                paymentService.verifyPayment(
                        email,
                        razorpayOrderId,
                        razorpayPaymentId,
                        razorpaySignature
                );

        return ResponseEntity.ok(response);
    }
    // 3. GET PAYMENT BY ORDER ID
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            Authentication authentication,
            @PathVariable Long orderId) {

        String email = authentication.getName();

        PaymentResponse response =
                paymentService.getPaymentByOrderId(
                        email,
                        orderId
                );

        return ResponseEntity.ok(response);
    }
    // 4. ADMIN - GET ALL PAYMENTS
    @GetMapping("/admin/all")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        List<PaymentResponse> payments =
                paymentService.getAllPayments();

        return ResponseEntity.ok(payments);
    }
}