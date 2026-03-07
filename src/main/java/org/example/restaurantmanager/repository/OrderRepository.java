package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    //Lấy danh sách đơn hàng theo trạng thái (VD: Lấy các đơn "Pending" để bếp nấu)
    List<Order> findByStatus(String status);
}