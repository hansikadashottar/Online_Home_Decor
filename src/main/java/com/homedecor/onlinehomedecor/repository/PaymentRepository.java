package com.homedecor.onlinehomedecor.repository;

import com.homedecor.onlinehomedecor.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by order ID
    Optional<Payment> findByOrderOrderId(Long orderId);

    // Find payment by Razorpay order ID
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Admin - get all payments, latest first
    List<Payment> findAllByOrderByPaymentDateDesc();
}