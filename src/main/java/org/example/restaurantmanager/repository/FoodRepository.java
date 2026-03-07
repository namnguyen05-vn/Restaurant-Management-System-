package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    // Tìm tất cả món ăn theo trạng thái (VD: Chỉ lấy món đang mở bán)
    List<Food> findByIsAvailable(Boolean isAvailable);

    // Tìm tất cả món ăn thuộc về 1 danh mục cụ thể
    List<Food> findByCategory_Id(Long categoryId);
}