package com.homedecor.onlinehomedecor.controller;

import com.homedecor.onlinehomedecor.dto.*;
import com.homedecor.onlinehomedecor.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // register
    @PostMapping
    public RegisterResponse saveUser(
            @Valid @RequestBody RegisterRequest request) {
        return userService.saveUser(request);
    }

    // login
    @PostMapping("/login")
    public LoginResponse loginUser(
            @RequestBody LoginRequest loginRequest) {
        return userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
    }

    // Forgot Password
    @PostMapping("/forgot-password")
    public String forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return userService.forgotPassword(request);
    }

    // Reset Password
    @PostMapping("/reset-password")
    public String resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(request);
    }

    // viewProfile
    @GetMapping("/{userId}")
    public UserProfileResponse getUserById(
            @PathVariable Long userId) {
        return userService.getUserById(userId);
    }

    // UpdateProfile
    @PutMapping("/{userId}")
    public UserProfileResponse updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request) {
        return userService.updateUser(userId, request);
    }

    // Delete User
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable Long userId) {
        boolean deleted = userService.deleteUser(userId);

        if (deleted) {
            return "User deleted successfully";
        }

        return "User not found";
    }
}