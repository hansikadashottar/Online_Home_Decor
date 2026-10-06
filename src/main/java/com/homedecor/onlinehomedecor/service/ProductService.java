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
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private static final Path PRODUCT_IMAGE_DIRECTORY =
            Paths.get(
                    "src",
                    "main",
                    "resources",
                    "static",
                    "images",
                    "products"
            );

    // CREATE PRODUCT
    public ProductResponse createProduct(ProductRequest request) {

        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException(
                    "Price must be greater than 0"
            );
        }

        if (request.getStock() == null || request.getStock() < 0) {
            throw new IllegalArgumentException(
                    "Stock cannot be negative"
            );
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        // Save uploaded image into static folder
        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            product.setImageUrl(
                    saveImage(request.getImage())
            );

        } else if (request.getImageUrl() != null
                && !request.getImageUrl().isBlank()) {

            product.setImageUrl(
                    normalizeImageUrl(request.getImageUrl())
            );
        }

        Product savedProduct =
                productRepository.save(product);

        return convertToResponse(savedProduct);
    }

    // GET ALL PRODUCTS
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET PRODUCTS BY CATEGORY
    public List<ProductResponse> getProductsByCategory(
            Long categoryId) {

        categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: "
                                        + categoryId
                        )
                );

        return productRepository
                .findByCategoryCategoryId(categoryId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET PRODUCT BY ID
    public ProductResponse getProductById(Long productId) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        return convertToResponse(product);
    }

    // SEARCH PRODUCTS
    public List<ProductResponse> searchProducts(String name) {

        return productRepository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // UPDATE PRODUCT
    public ProductResponse updateProduct(
            Long productId,
            ProductRequest request) {

        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException(
                    "Price must be greater than 0"
            );
        }

        if (request.getStock() == null || request.getStock() < 0) {
            throw new IllegalArgumentException(
                    "Stock cannot be negative"
            );
        }

        Product existingProduct =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());

        // Update category only when provided
        if (request.getCategoryId() != null) {

            Category category = categoryRepository
                    .findById(request.getCategoryId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Category not found with id: "
                                            + request.getCategoryId()
                            )
                    );

            existingProduct.setCategory(category);
        }

        // Replace image only when a new image is selected
        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            String oldImageUrl =
                    existingProduct.getImageUrl();

            String newImageUrl =
                    saveImage(request.getImage());

            existingProduct.setImageUrl(newImageUrl);

            deleteOldImage(oldImageUrl);
        }

        return convertToResponse(
                productRepository.save(existingProduct)
        );
    }

    // DELETE PRODUCT
    public String deleteProduct(Long productId) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        deleteOldImage(product.getImageUrl());

        productRepository.delete(product);

        return "Product deleted successfully";
    }

    // SAVE IMAGE TO STATIC FOLDER
    private String saveImage(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            return null;
        }

        if (image.getContentType() == null
                || !image.getContentType().startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        try {

            Files.createDirectories(
                    PRODUCT_IMAGE_DIRECTORY
            );

            String originalFilename =
                    image.getOriginalFilename();

            if (originalFilename == null
                    || originalFilename.isBlank()) {

                throw new IllegalArgumentException(
                        "Invalid image file name"
                );
            }

            // Remove any folder path from filename
            String safeFilename =
                    StringUtils.cleanPath(
                            originalFilename
                    );

            safeFilename =
                    Paths.get(safeFilename)
                            .getFileName()
                            .toString();

            // Prevent overwriting an existing image
            String finalFilename =
                    getUniqueFilename(safeFilename);

            Path targetPath =
                    PRODUCT_IMAGE_DIRECTORY
                            .resolve(finalFilename)
                            .normalize();

            Files.copy(
                    image.getInputStream(),
                    targetPath
            );

            // This path is what gets stored in DB
            return "/images/products/"
                    + finalFilename;

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Unable to save product image",
                    exception
            );
        }
    }

    // GENERATE UNIQUE FILE NAME IF SAME NAME EXISTS
    private String getUniqueFilename(String filename) {

        Path originalPath =
                PRODUCT_IMAGE_DIRECTORY.resolve(filename);

        if (!Files.exists(originalPath)) {
            return filename;
        }

        String baseName = filename;
        String extension = "";

        int dotIndex = filename.lastIndexOf('.');

        if (dotIndex > 0) {
            baseName = filename.substring(0, dotIndex);
            extension = filename.substring(dotIndex);
        }

        int counter = 1;

        while (true) {

            String newFilename =
                    baseName
                            + "_"
                            + counter
                            + extension;

            Path newPath =
                    PRODUCT_IMAGE_DIRECTORY
                            .resolve(newFilename);

            if (!Files.exists(newPath)) {
                return newFilename;
            }

            counter++;
        }
    }

    // DELETE OLD PRODUCT IMAGE
    private void deleteOldImage(String imageUrl) {

        if (imageUrl == null
                || imageUrl.isBlank()
                || imageUrl.startsWith("http://")
                || imageUrl.startsWith("https://")) {

            return;
        }

        try {

            String fileName =
                    imageUrl.substring(
                            imageUrl.lastIndexOf('/') + 1
                    );

            if (fileName.isBlank()) {
                return;
            }

            Path imagePath =
                    PRODUCT_IMAGE_DIRECTORY
                            .resolve(fileName)
                            .normalize();

            if (imagePath.getParent()
                    .equals(PRODUCT_IMAGE_DIRECTORY)) {

                Files.deleteIfExists(imagePath);
            }

        } catch (IOException exception) {

            System.err.println(
                    "Unable to delete old product image: "
                            + exception.getMessage()
            );
        }
    }

    // NORMALIZE OLD IMAGE VALUES
    private String normalizeImageUrl(String imageUrl) {

        if (imageUrl == null
                || imageUrl.isBlank()) {

            return imageUrl;
        }

        if (imageUrl.startsWith("http://")
                || imageUrl.startsWith("https://")
                || imageUrl.startsWith("/images/products/")) {

            return imageUrl;
        }

        return "/images/products/"
                + imageUrl.trim();
    }

    // CONVERT ENTITY TO RESPONSE
    private ProductResponse convertToResponse(
            Product product) {

        ProductResponse response =
                new ProductResponse();

        response.setProductId(
                product.getProductId()
        );

        response.setName(
                product.getName()
        );

        response.setDescription(
                product.getDescription()
        );

        response.setPrice(
                product.getPrice()
        );

        response.setStock(
                product.getStock()
        );

        response.setImageUrl(
                normalizeImageUrl(
                        product.getImageUrl()
                )
        );

        if (product.getCategory() != null) {

            response.setCategoryId(
                    product.getCategory()
                            .getCategoryId()
            );
        }

        return response;
    }
}