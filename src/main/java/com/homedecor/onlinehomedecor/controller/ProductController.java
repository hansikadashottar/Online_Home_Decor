package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.ProductRequest;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // create_product
    @PostMapping
    public ProductResponse createProduct(
            @Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    // view_all_product
    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    // search_product
    @GetMapping("/search")
    public List<ProductResponse> searchProducts(
            @RequestParam String name) {
        return productService.searchProducts(name);
    }

    // product_by_id
    @GetMapping("/{productId}")
    public ProductResponse getProductById(
            @PathVariable Long productId) {
        return productService.getProductById(productId);
    }

    // update_for_admin
    @PutMapping("/{productId}")
    public ProductResponse updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(productId, request);
    }

    // delete_for_admin
    @DeleteMapping("/{productId}")
    public String deleteProduct(
            @PathVariable Long productId) {
        return productService.deleteProduct(productId);
    }
}