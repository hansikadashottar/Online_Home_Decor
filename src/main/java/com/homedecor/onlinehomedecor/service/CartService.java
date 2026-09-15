package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.CartItemResponse;
import com.homedecor.onlinehomedecor.entity.Cart;
import com.homedecor.onlinehomedecor.entity.CartItem;
import com.homedecor.onlinehomedecor.entity.Product;
import com.homedecor.onlinehomedecor.entity.User;
import com.homedecor.onlinehomedecor.exception.UserNotFoundException;
import com.homedecor.onlinehomedecor.repository.CartItemRepository;
import com.homedecor.onlinehomedecor.repository.CartRepository;
import com.homedecor.onlinehomedecor.repository.ProductRepository;
import com.homedecor.onlinehomedecor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. GET OR CREATE CART
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserUserId(user.getUserId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    // 2. ADD PRODUCT TO CART
    public CartItemResponse addToCart(
            String email,
            Long productId,
            Integer quantity) {

        User user = getUserByEmail(email);

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found with id: " + productId));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        Cart cart = getOrCreateCart(user);

        Optional<CartItem> existingItem =
                cartItemRepository.findByCartCartIdAndProductProductId(
                        cart.getCartId(), productId);

        if (existingItem.isPresent()) {

            CartItem cartItem = existingItem.get();

            int newQuantity = cartItem.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Insufficient stock");
            }

            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);

            return convertToResponse(cartItem);

        } else {

            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);

            cartItemRepository.save(cartItem);

            return convertToResponse(cartItem);
        }
    }

    // 3. VIEW CART
    public List<CartItemResponse> getCartItems(String email) {

        User user = getUserByEmail(email);

        Cart cart = getOrCreateCart(user);

        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(cart.getCartId());

        return cartItems.stream()
                .map(this::convertToResponse)
                .toList();
    }

    // 4. UPDATE CART ITEM
    public CartItemResponse updateCartItem(
            String email,
            Long cartItemId,
            Integer quantity) {

        User user = getUserByEmail(email);

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Cart cart = getOrCreateCart(user);

        CartItem cartItem =
                cartItemRepository.findByCartCartIdAndCartItemId(
                                cart.getCartId(), cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException("Cart item not found"));

        Product product = cartItem.getProduct();

        if (quantity > product.getStock()) {
            throw new RuntimeException("Insufficient stock");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return convertToResponse(cartItem);
    }

    // 5. REMOVE CART ITEM
    public void removeCartItem(
            String email,
            Long cartItemId) {

        User user = getUserByEmail(email);

        Cart cart = getOrCreateCart(user);

        CartItem cartItem =
                cartItemRepository.findByCartCartIdAndCartItemId(
                                cart.getCartId(), cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }

    // 6. CLEAR CART
    public void clearCart(String email) {

        User user = getUserByEmail(email);

        Cart cart = getOrCreateCart(user);

        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(cart.getCartId());

        cartItemRepository.deleteAll(cartItems);
    }

    // 7. FIND USER
    private User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UserNotFoundException("User not found");
        }

        return user;
    }

    // 8. CONVERT TO RESPONSE
    private CartItemResponse convertToResponse(CartItem cartItem) {

        Product product = cartItem.getProduct();

        return new CartItemResponse(
                cartItem.getCartItemId(),
                product.getProductId(),
                product.getName(),
                product.getPrice(),
                cartItem.getQuantity(),
                product.getPrice() * cartItem.getQuantity()
        );
    }
}