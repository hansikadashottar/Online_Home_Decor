package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.ProductRequest;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProductResponse createProduct(
            @Valid @ModelAttribute ProductRequest request) {

        return productService.createProduct(request);
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {

        return productService.getAllProducts();
    }

    @GetMapping("/search")
    public List<ProductResponse> searchProducts(
            @RequestParam String name) {

        return productService.searchProducts(name);
    }

    @GetMapping("/{productId}")
    public ProductResponse getProductById(
            @PathVariable Long productId) {

        return productService.getProductById(productId);
    }

    @PutMapping(
            value = "/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProductResponse updateProduct(
            @PathVariable Long productId,
            @Valid @ModelAttribute ProductRequest request) {

        return productService.updateProduct(
                productId,
                request
        );
    }

    @DeleteMapping("/{productId}")
    public String deleteProduct(
            @PathVariable Long productId) {

        return productService.deleteProduct(productId);
    }
}