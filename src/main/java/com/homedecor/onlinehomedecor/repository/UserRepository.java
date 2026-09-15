package com.homedecor.onlinehomedecor.repository;

import com.homedecor.onlinehomedecor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByOtp(String otp);
}
