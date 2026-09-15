package com.homedecor.onlinehomedecor.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    private String fullName;

    private String phone;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public UpdateProfileRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}