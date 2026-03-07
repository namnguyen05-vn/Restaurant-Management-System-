package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    //Tìm các bàn đang trống hoặc đang có khách
    List<RestaurantTable> findByStatus(String status);
}