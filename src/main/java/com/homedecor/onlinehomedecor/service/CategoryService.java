package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.CategoryRequest;
import com.homedecor.onlinehomedecor.dto.CategoryResponse;
import com.homedecor.onlinehomedecor.entity.Category;
import com.homedecor.onlinehomedecor.repository.CategoryRepository;
import jakarta.transaction.Transactional;
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
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    private static final Path CATEGORY_IMAGE_DIRECTORY =
            Paths.get(
                    "src",
                    "main",
                    "resources",
                    "static",
                    "images",
                    "categories"
            );

    // CREATE CATEGORY
    public CategoryResponse createCategory(
            CategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        // Save uploaded image to static folder
        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            category.setImageUrl(
                    saveImage(request.getImage())
            );

        } else if (request.getImageUrl() != null
                && !request.getImageUrl().isBlank()) {

            category.setImageUrl(
                    normalizeImageUrl(
                            request.getImageUrl()
                    )
            );
        }

        Category savedCategory =
                categoryRepository.save(category);

        return convertToResponse(savedCategory);
    }

    // GET ALL CATEGORIES
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET CATEGORY BY ID
    public CategoryResponse getCategoryById(
            Long categoryId) {

        Category category =
                categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: "
                                                + categoryId
                                )
                        );

        return convertToResponse(category);
    }

    // UPDATE CATEGORY
    public CategoryResponse updateCategory(
            Long categoryId,
            CategoryRequest request) {

        Category existingCategory =
                categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: "
                                                + categoryId
                                )
                        );

        existingCategory.setName(
                request.getName()
        );

        existingCategory.setDescription(
                request.getDescription()
        );

        // Replace image only if new file selected
        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            String oldImageUrl =
                    existingCategory.getImageUrl();

            String newImageUrl =
                    saveImage(request.getImage());

            existingCategory.setImageUrl(
                    newImageUrl
            );

            deleteOldImage(oldImageUrl);
        }

        return convertToResponse(
                categoryRepository.save(existingCategory)
        );
    }

    // DELETE CATEGORY
    public boolean deleteCategory(Long categoryId) {

        Category category =
                categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: "
                                                + categoryId
                                )
                        );

        deleteOldImage(category.getImageUrl());

        categoryRepository.delete(category);

        return true;
    }

    // SAVE CATEGORY IMAGE
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
                    CATEGORY_IMAGE_DIRECTORY
            );

            String originalFilename =
                    image.getOriginalFilename();

            if (originalFilename == null
                    || originalFilename.isBlank()) {

                throw new IllegalArgumentException(
                        "Invalid image file name"
                );
            }

            String safeFilename =
                    StringUtils.cleanPath(
                            originalFilename
                    );

            safeFilename =
                    Paths.get(safeFilename)
                            .getFileName()
                            .toString();

            String finalFilename =
                    getUniqueFilename(safeFilename);

            Path targetPath =
                    CATEGORY_IMAGE_DIRECTORY
                            .resolve(finalFilename)
                            .normalize();

            Files.copy(
                    image.getInputStream(),
                    targetPath
            );

            return "/images/categories/"
                    + finalFilename;

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Unable to save category image",
                    exception
            );
        }
    }

    // GENERATE UNIQUE FILE NAME
    private String getUniqueFilename(String filename) {

        Path originalPath =
                CATEGORY_IMAGE_DIRECTORY.resolve(filename);

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
                    CATEGORY_IMAGE_DIRECTORY
                            .resolve(newFilename);

            if (!Files.exists(newPath)) {
                return newFilename;
            }

            counter++;
        }
    }

    // DELETE OLD IMAGE
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
                    CATEGORY_IMAGE_DIRECTORY
                            .resolve(fileName)
                            .normalize();

            if (imagePath.getParent()
                    .equals(CATEGORY_IMAGE_DIRECTORY)) {

                Files.deleteIfExists(imagePath);
            }

        } catch (IOException exception) {

            System.err.println(
                    "Unable to delete old category image: "
                            + exception.getMessage()
            );
        }
    }

    // NORMALIZE OLD IMAGE VALUES
    private String normalizeImageUrl(
            String imageUrl) {

        if (imageUrl == null
                || imageUrl.isBlank()) {

            return imageUrl;
        }

        if (imageUrl.startsWith("http://")
                || imageUrl.startsWith("https://")
                || imageUrl.startsWith("/images/categories/")) {

            return imageUrl;
        }

        return "/images/categories/"
                + imageUrl.trim();
    }

    // CONVERT ENTITY TO RESPONSE
    private CategoryResponse convertToResponse(
            Category category) {

        CategoryResponse response =
                new CategoryResponse();

        response.setCategoryId(
                category.getCategoryId()
        );

        response.setName(
                category.getName()
        );

        response.setDescription(
                category.getDescription()
        );

        response.setImageUrl(
                normalizeImageUrl(
                        category.getImageUrl()
                )
        );

        return response;
    }
}