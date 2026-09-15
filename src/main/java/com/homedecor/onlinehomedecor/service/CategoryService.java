package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.CategoryRequest;
import com.homedecor.onlinehomedecor.dto.CategoryResponse;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.entity.Category;
import com.homedecor.onlinehomedecor.entity.Product;
import com.homedecor.onlinehomedecor.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Create Category
    public CategoryResponse createCategory(CategoryRequest request) {

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category savedCategory = categoryRepository.save(category);

        return convertToResponse(savedCategory);
    }

    // Get all categories
    public List<CategoryResponse> getAllCategories() {

        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> responses = new ArrayList<>();

        for (Category category : categories) {
            responses.add(convertToResponse(category));
        }

        return responses;
    }

    // Get category by ID
    public CategoryResponse getCategoryById(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        )
                );

        return convertToResponse(category);
    }
    // Get products by category
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        )
                );

        List<Product> products = category.getProducts();
        List<ProductResponse> responses = new ArrayList<>();

        for (Product product : products) {

            ProductResponse response = new ProductResponse();

            response.setProductId(product.getProductId());
            response.setName(product.getName());
            response.setDescription(product.getDescription());
            response.setPrice(product.getPrice());
            response.setStock(product.getStock());
            response.setImageUrl(product.getImageUrl());
            response.setCategoryId(category.getCategoryId());

            responses.add(response);
        }

        return responses;
    }
    // Update category
    public CategoryResponse updateCategory(
            Long categoryId,
            CategoryRequest request) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        )
                );

        if (request.getName() != null) {
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        Category updatedCategory = categoryRepository.save(category);

        return convertToResponse(updatedCategory);
    }
    // Delete category
    public boolean deleteCategory(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        )
                );

        categoryRepository.delete(category);

        return true;
    }
    // Convert Category entity to CategoryResponse
    private CategoryResponse convertToResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setCategoryId(category.getCategoryId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());

        return response;
    }
}
