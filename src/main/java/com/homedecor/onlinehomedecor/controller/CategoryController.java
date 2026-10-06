package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.CategoryRequest;
import com.homedecor.onlinehomedecor.dto.CategoryResponse;
import com.homedecor.onlinehomedecor.dto.ProductResponse;
import com.homedecor.onlinehomedecor.service.CategoryService;
import com.homedecor.onlinehomedecor.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public CategoryResponse createCategory(
            @Valid @ModelAttribute CategoryRequest request) {

        return categoryService.createCategory(request);
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories() {

        return categoryService.getAllCategories();
    }

    @GetMapping("/{categoryId}")
    public CategoryResponse getCategoryById(
            @PathVariable Long categoryId) {

        return categoryService.getCategoryById(
                categoryId
        );
    }

    @GetMapping("/{categoryId}/products")
    public List<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId) {

        return productService.getProductsByCategory(
                categoryId
        );
    }

    @PutMapping(
            value = "/{categoryId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public CategoryResponse updateCategory(
            @PathVariable Long categoryId,
            @Valid @ModelAttribute CategoryRequest request) {

        return categoryService.updateCategory(
                categoryId,
                request
        );
    }

    @DeleteMapping("/{categoryId}")
    public boolean deleteCategory(
            @PathVariable Long categoryId) {

        return categoryService.deleteCategory(
                categoryId
        );
    }
}