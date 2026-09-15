    package com.homedecor.onlinehomedecor.entity;

    import jakarta.persistence.*;

    import java.util.Date;

    @Entity
    @Table(name = "users")
    public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long userId;
        @Column(nullable = false)
        private String fullName;
        @Column(unique = true, nullable = false)
        private String email;
        @Column(nullable = false)
        private String password;
        @Column(nullable = false)
        private String phone;
        private String role = "CUSTOMER";
        private String otp;
        private Date otpExpiry;

        public Long getUserId() {
            return userId;
        }
        public String getFullName() {
            return fullName;
        }
        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
        public String getEmail() {
            return email;
        }
        public void setEmail(String email) {
            this.email = email;
        }
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
        public String getPhone() {
            return phone;
        }
        public void setPhone(String phone) {
            this.phone = phone;
        }
        public String getRole() {
            return role;
        }
        public void setRole(String role) {
            this.role = role;
        }
        public String getOtp() {
            return otp;
        }
        public void setOtp(String otp) {
            this.otp = otp;
        }
        public Date getOtpExpiry() {
            return otpExpiry;
        }
        public void setOtpExpiry(Date otpExpiry) {
            this.otpExpiry = otpExpiry;
        }
        public User() {
        }
    }
