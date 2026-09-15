package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.CartItemRequest;
import com.homedecor.onlinehomedecor.dto.CartItemResponse;
import com.homedecor.onlinehomedecor.dto.CartItemUpdateRequest;
import com.homedecor.onlinehomedecor.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // 1. ADD PRODUCT TO CART
    @PostMapping("/add")
    public CartItemResponse addToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return cartService.addToCart(
                email,
                request.getProductId(),
                request.getQuantity()
        );
    }

    // 2. VIEW CART
    @GetMapping
    public List<CartItemResponse> getCart(
            Authentication authentication) {

        String email = authentication.getName();

        return cartService.getCartItems(email);
    }

    // 3. UPDATE CART ITEM
    @PutMapping("/item/{cartItemId}")
    public CartItemResponse updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartItemUpdateRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return cartService.updateCartItem(
                email,
                cartItemId,
                request.getQuantity()
        );
    }

    // 4. REMOVE CART ITEM
    @DeleteMapping("/item/{cartItemId}")
    public String removeCartItem(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        String email = authentication.getName();

        cartService.removeCartItem(
                email,
                cartItemId
        );

        return "Cart item removed successfully";
    }

    // 5. CLEAR CART
    @DeleteMapping("/clear")
    public String clearCart(
            Authentication authentication) {

        String email = authentication.getName();

        cartService.clearCart(email);

        return "Cart cleared successfully";
    }
}