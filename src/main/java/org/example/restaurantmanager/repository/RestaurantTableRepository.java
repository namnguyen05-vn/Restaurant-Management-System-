package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    //Tìm các bàn đang trống hoặc đang có khách
    List<RestaurantTable> findByStatus(String status);
    Page<RestaurantTable> findByTableNumberContainingIgnoreCase(String tableNumber, Pageable pageable);
}