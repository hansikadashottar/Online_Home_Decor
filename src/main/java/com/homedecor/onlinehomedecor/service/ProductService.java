package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.ProductRequest;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.entity.Category;
import com.homedecor.onlinehomedecor.entity.Product;
import com.homedecor.onlinehomedecor.exception.UserNotFoundException;
import com.homedecor.onlinehomedecor.repository.CategoryRepository;
import com.homedecor.onlinehomedecor.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Create product
    public ProductResponse createProduct(ProductRequest request) {
        if (request.getPrice() != null && request.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        if (request.getStock() != null && request.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        Product product = new Product();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + request.getCategoryId()
                        )
                );

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());

        Product savedProduct = productRepository.save(product);

        return convertToResponse(savedProduct);
    }

    // Get all products
    public List<ProductResponse> getAllProducts() {

        List<Product> products = productRepository.findAll();
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(convertToResponse(product));
        }

        return responses;
    }

    // Get products by category
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        List<Product> products =
                productRepository.findByCategoryCategoryId(categoryId);

        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(convertToResponse(product));
        }

        return responses;
    }

    // Get product by ID
    public ProductResponse getProductById(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        return convertToResponse(product);
    }

    // Search product
    public List<ProductResponse> searchProducts(String name) {

        List<Product> products =
                productRepository.findByNameContainingIgnoreCase(name);

        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            responses.add(convertToResponse(product));
        }

        return responses;
    }

    // Update product for admin
    public ProductResponse updateProduct(
            Long productId,
            ProductRequest request) {
        if (request.getPrice() != null && request.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        if (request.getStock() != null && request.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (request.getName() != null) {
            existingProduct.setName(request.getName());
        }

        if (request.getDescription() != null) {
            existingProduct.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            existingProduct.setPrice(request.getPrice());
        }

        if (request.getStock() != null) {
            existingProduct.setStock(request.getStock());
        }

        if (request.getImageUrl() != null) {
            existingProduct.setImageUrl(request.getImageUrl());
        }

        if (request.getCategoryId() != null) {

            Category category = categoryRepository.findById(
                    request.getCategoryId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Category not found with id: "
                                    + request.getCategoryId()
                    )
            );

            existingProduct.setCategory(category);
        }

        Product updatedProduct = productRepository.save(existingProduct);

        return convertToResponse(updatedProduct);
    }

    // Delete product for admin
    public String deleteProduct(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        productRepository.delete(product);

        return "Product deleted successfully";
    }

    // Convert Product entity to ProductResponse
    private ProductResponse convertToResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setProductId(product.getProductId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setImageUrl(product.getImageUrl());
        response.setCategoryId(product.getCategory().getCategoryId());

        return response;
    }
}

