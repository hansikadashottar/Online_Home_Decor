package com.homedecor.onlinehomedecor.repository;

import com.homedecor.onlinehomedecor.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserEmailOrderByOrderDateDesc(String email);
    List<Order> findAllByOrderByOrderDateDesc();
}