package com.homedecor.onlinehomedecor.repository;

import com.homedecor.onlinehomedecor.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryCategoryId(Long categoryId);
}
