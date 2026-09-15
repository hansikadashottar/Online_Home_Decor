package com.homedecor.onlinehomedecor.repository;

import com.homedecor.onlinehomedecor.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartCartId(Long cartId);
    Optional<CartItem> findByCartCartIdAndProductProductId(
            Long cartId,
            Long productId
    );
    Optional<CartItem> findByCartCartIdAndCartItemId(
            Long cartId,
            Long cartItemId
    );
}
