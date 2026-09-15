package com.homedecor.onlinehomedecor.service;

import com.homedecor.onlinehomedecor.dto.*;
import com.homedecor.onlinehomedecor.entity.User;
import com.homedecor.onlinehomedecor.exception.DuplicateEmailException;
import com.homedecor.onlinehomedecor.exception.InvalidCredentialsException;
import com.homedecor.onlinehomedecor.exception.UnauthorizedActionException;
import com.homedecor.onlinehomedecor.exception.UserNotFoundException;
import com.homedecor.onlinehomedecor.repository.UserRepository;
import com.homedecor.onlinehomedecor.security.JwtUtil;
import com.homedecor.onlinehomedecor.util.EmailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Date;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private EmailUtil emailUtil;
    //Register
    public RegisterResponse saveUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new DuplicateEmailException("Email already exists");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("CUSTOMER");

        User savedUser = userRepository.save(user);
        RegisterResponse response = new RegisterResponse();
        response.setUserId(savedUser.getUserId());
        response.setFullName(savedUser.getFullName());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setRole(savedUser.getRole());
        return response;
    }
    //Login
    public LoginResponse loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        LoginResponse response = new LoginResponse();
        response.setMessage("Login successful");
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
    // Forgot Password
    private final SecureRandom secureRandom = new SecureRandom();
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new UserNotFoundException(
                    "User not found with email: " + request.getEmail()
            );
        }
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );
        user.setOtp(otp);
        user.setOtpExpiry(
                new Date(System.currentTimeMillis() + 2 * 60 * 1000)
        );
        userRepository.save(user);
        emailUtil.sendOtpEmail(user.getEmail(), otp);
        return "OTP sent successfully to your email";
    }
    // Reset Password
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByOtp(request.getOtp());
        if (user == null) {
            throw new InvalidCredentialsException(
                    "Invalid OTP"
            );
        }
        if (user.getOtpExpiry() == null ||
                user.getOtpExpiry().before(new Date())) {
            throw new InvalidCredentialsException(
                    "OTP has expired"
            );
        }
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return "Password reset successfully";
    }
    //viewProfile
    public UserProfileResponse getUserById(Long userId) {
        User requestedUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + userId
                        )
                );
        User authenticatedUser = getAuthenticatedUser();
        if (!requestedUser.getUserId().equals(authenticatedUser.getUserId())) {
            throw new UnauthorizedActionException(
                    "You are not allowed to access this profile"
            );
        }
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(requestedUser.getUserId());
        response.setFullName(requestedUser.getFullName());
        response.setEmail(requestedUser.getEmail());
        response.setPhone(requestedUser.getPhone());
        response.setRole(requestedUser.getRole());
        return response;
    }
    //UpdateProfile
    public UserProfileResponse updateUser(Long userId, UpdateProfileRequest request) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + userId
                        )
                );
        User authenticatedUser = getAuthenticatedUser();
        if (!existingUser.getUserId().equals(authenticatedUser.getUserId())) {
            throw new UnauthorizedActionException(
                    "You are not allowed to update this profile"
            );
        }
        if (request.getFullName() != null) {
            existingUser.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            existingUser.setPhone(request.getPhone());
        }
        if (request.getPassword() != null) {
            existingUser.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }
        User updatedUser = userRepository.save(existingUser);
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(updatedUser.getUserId());
        response.setFullName(updatedUser.getFullName());
        response.setEmail(updatedUser.getEmail());
        response.setPhone(updatedUser.getPhone());
        response.setRole(updatedUser.getRole());
        return response;
    }
    //Delete User
    public boolean deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + userId
                        )
                );
        User authenticatedUser = getAuthenticatedUser();
        if (!user.getUserId().equals(authenticatedUser.getUserId())) {
            throw new UnauthorizedActionException(
                    "You are not allowed to delete this account"
            );
        }
        userRepository.delete(user);
        return true;
    }
    //HelperMethod
    private User getAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email);
    }
}
