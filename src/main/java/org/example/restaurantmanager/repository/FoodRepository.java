package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// 👉 ĐÃ SỬA: Import đúng chuẩn phân trang của Spring Boot
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    // Tìm tất cả món ăn theo trạng thái
    List<Food> findByIsAvailable(Boolean isAvailable);

    // Tìm tất cả món ăn thuộc về 1 danh mục cụ thể
    List<Food> findByCategory_Id(Long categoryId);

    // Tìm kiếm không phân trang (Hàm cũ của bạn)
    List<Food> findByNameContainingIgnoreCase(String keyword);

    // Tìm kiếm có phân trang (Dùng cho giao diện Admin mới)
    Page<Food> findByNameContainingIgnoreCase(String name, Pageable pageable);
}