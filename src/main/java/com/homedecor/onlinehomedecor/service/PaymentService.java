package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.PaymentRequest;
import com.homedecor.onlinehomedecor.dto.PaymentResponse;
import com.homedecor.onlinehomedecor.entity.Order;
import com.homedecor.onlinehomedecor.entity.Payment;
import com.homedecor.onlinehomedecor.entity.User;
import com.homedecor.onlinehomedecor.exception.OrderNotFoundException;
import com.homedecor.onlinehomedecor.exception.UnauthorizedActionException;
import com.homedecor.onlinehomedecor.exception.UserNotFoundException;
import com.homedecor.onlinehomedecor.repository.OrderRepository;
import com.homedecor.onlinehomedecor.repository.PaymentRepository;
import com.homedecor.onlinehomedecor.repository.UserRepository;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    // 1. CHECK USER AND ORDER
    private Order getCustomerOrder(String email, Long orderId) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UserNotFoundException("User not found");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedActionException(
                    "Order does not belong to this user"
            );
        }

        return order;
    }


    // 2. CHECK ORDER STATUS
    private void validateOrderStatus(Order order) {

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException(
                    "Cancelled order cannot be paid"
            );
        }

        if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException(
                    "Delivered order cannot be paid"
            );
        }
    }


    // 3. CHECK EXISTING PAYMENT
    private Payment checkExistingPayment(Long orderId) {

        return paymentRepository
                .findByOrderOrderId(orderId)
                .orElse(null);
    }


    // 4. CHECK PAYMENT STATUS
    private void validateExistingPayment(Payment payment) {

        if (payment != null &&
                "SUCCESS".equalsIgnoreCase(
                        payment.getPaymentStatus())) {

            throw new RuntimeException(
                    "Order is already paid"
            );
        }
    }


    // 5. GET ORDER AMOUNT
    private Double getPaymentAmount(Order order) {

        if (order.getTotalAmount() == null ||
                order.getTotalAmount() <= 0) {

            throw new RuntimeException(
                    "Invalid order amount"
            );
        }

        return order.getTotalAmount();
    }


    // 6. VALIDATE PAYMENT METHOD
    private String validatePaymentMethod(String paymentMethod) {

        if (paymentMethod == null ||
                paymentMethod.isBlank()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        String method = paymentMethod.toUpperCase();

        if (!method.equals("COD")
                && !method.equals("UPI")
                && !method.equals("CARD")
                && !method.equals("NETBANKING")) {

            throw new RuntimeException(
                    "Invalid payment method"
            );
        }

        return method;
    }


    // 7. BUILD PAYMENT
    private Payment buildPayment(
            Order order,
            Double amount,
            String paymentMethod) {

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());

        return payment;
    }


    // 8. HANDLE COD PAYMENT
    private void handleCodPayment(Payment payment) {

        payment.setPaymentStatus("PENDING");
        payment.setRazorpayOrderId(null);
        payment.setRazorpayPaymentId(null);
    }


    // 9. CREATE RAZORPAY ORDER
    private String createRazorpayOrder(Double amount) {

        try {
            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            JSONObject options = new JSONObject();

            options.put(
                    "amount",
                    (int) Math.round(amount * 100)
            );

            options.put("currency", "INR");

            options.put(
                    "receipt",
                    "order_" + System.currentTimeMillis()
            );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(options);

            return razorpayOrder.get("id");

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create Razorpay order"
            );
        }
    }


    // 10. HANDLE ONLINE PAYMENT
    private void handleOnlinePayment(
            Payment payment,
            Double amount) {

        String razorpayOrderId =
                createRazorpayOrder(amount);

        payment.setRazorpayOrderId(
                razorpayOrderId
        );

        payment.setRazorpayPaymentId(null);

        payment.setPaymentStatus("PENDING");
    }


    // 11. CREATE PAYMENT
    public PaymentResponse createPayment(
            String email,
            PaymentRequest request) {

        Order order = getCustomerOrder(
                email,
                request.getOrderId()
        );

        validateOrderStatus(order);

        Payment existingPayment =
                checkExistingPayment(
                        order.getOrderId()
                );

        validateExistingPayment(existingPayment);

        Double amount =
                getPaymentAmount(order);

        String paymentMethod =
                validatePaymentMethod(
                        request.getPaymentMethod()
                );

        Payment payment;

        if (existingPayment != null) {

            payment = existingPayment;

            payment.setPaymentMethod(
                    paymentMethod
            );

            payment.setAmount(amount);

            payment.setPaymentStatus(
                    "PENDING"
            );

            payment.setPaymentDate(
                    LocalDateTime.now()
            );

        } else {

            payment = buildPayment(
                    order,
                    amount,
                    paymentMethod
            );
        }

        if (paymentMethod.equals("COD")) {

            handleCodPayment(payment);

        } else {

            handleOnlinePayment(
                    payment,
                    amount
            );
        }

        payment =
                paymentRepository.save(payment);

        return convertToResponse(payment);
    }


    // 12. VERIFY RAZORPAY PAYMENT
    private void verifyRazorpayPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        try {

            JSONObject attributes =
                    new JSONObject();

            attributes.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            attributes.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            attributes.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            com.razorpay.Utils.verifyPaymentSignature(
                    attributes,
                    razorpayKeySecret
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Payment verification failed"
            );
        }
    }


    // 13. MARK PAYMENT SUCCESS
    private Payment markPaymentSuccess(
            Payment payment,
            String razorpayPaymentId) {

        payment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        payment.setPaymentStatus(
                "SUCCESS"
        );

        payment.setPaymentDate(
                LocalDateTime.now()
        );

        return paymentRepository.save(payment);
    }


    // 14. VERIFY PAYMENT
    public PaymentResponse verifyPayment(
            String email,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        if (razorpayOrderId == null ||
                razorpayOrderId.isBlank()
                || razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()
                || razorpaySignature == null ||
                razorpaySignature.isBlank()) {

            throw new RuntimeException(
                    "Payment verification details are required"
            );
        }

        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                )
                        );

        // Check logged-in customer owns this order
        Order order = getCustomerOrder(
                email,
                payment.getOrder().getOrderId()
        );

        // Check order status
        validateOrderStatus(order);

        // Check payment is still pending
        if ("SUCCESS".equalsIgnoreCase(
                payment.getPaymentStatus())) {

            throw new RuntimeException(
                    "Payment is already successful"
            );
        }

        // Verify Razorpay signature
        verifyRazorpayPayment(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
        );

        // Mark payment successful
        payment = markPaymentSuccess(
                payment,
                razorpayPaymentId
        );

        return convertToResponse(payment);
    }


    // 15. GET PAYMENT BY ORDER ID
    public PaymentResponse getPaymentByOrderId(
            String email,
            Long orderId) {

        // Check logged-in customer owns this order
        getCustomerOrder(
                email,
                orderId
        );

        Payment payment =
                paymentRepository
                        .findByOrderOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"
                                )
                        );

        return convertToResponse(payment);
    }


    // 16. GET ALL PAYMENTS - ADMIN
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAllByOrderByPaymentDateDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // 17. CONVERT PAYMENT RESPONSE
    private PaymentResponse convertToResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setPaymentId(
                payment.getPaymentId()
        );

        response.setOrderId(
                payment.getOrder().getOrderId()
        );

        response.setPaymentMethod(
                payment.getPaymentMethod()
        );

        response.setPaymentStatus(
                payment.getPaymentStatus()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setRazorpayOrderId(
                payment.getRazorpayOrderId()
        );

        response.setRazorpayPaymentId(
                payment.getRazorpayPaymentId()
        );

        response.setPaymentDate(
                payment.getPaymentDate()
        );

        return response;
    }
}