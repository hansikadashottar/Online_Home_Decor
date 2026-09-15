package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.CategoryRequest;
import com.homedecor.onlinehomedecor.dto.CategoryResponse;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.service.CategoryService;
import com.homedecor.onlinehomedecor.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    // Create Category
    @PostMapping
    public CategoryResponse createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    // get_all_category
    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // get_category_byid
    @GetMapping("/{categoryId}")
    public CategoryResponse getCategoryById(
            @PathVariable Long categoryId) {
        return categoryService.getCategoryById(categoryId);
    }

    // get_products_by_category
    @GetMapping("/{categoryId}/products")
    public List<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId);
    }

    // update_category
    @PutMapping("/{categoryId}")
    public CategoryResponse updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(categoryId, request);
    }

    // delete_category
    @DeleteMapping("/{categoryId}")
    public boolean deleteCategory(
            @PathVariable Long categoryId) {
        return categoryService.deleteCategory(categoryId);
    }
}