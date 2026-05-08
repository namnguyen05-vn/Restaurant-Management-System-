package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.model.Food;
import org.example.restaurantmanager.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;

    // 1. LẤY DANH SÁCH & TÌM KIẾM TÍCH HỢP (Trả về Page để Frontend phân trang)
    @GetMapping
    public ResponseEntity<Page<Food>> getAllFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword // 👈 Hứng từ khóa từ Frontend gửi lên
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Food> foodPage;

        // Nếu người dùng có gõ chữ vào ô tìm kiếm
        if (keyword != null && !keyword.trim().isEmpty()) {
            foodPage = foodRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable);
        }
        // Nếu ô tìm kiếm trống (lấy tất cả)
        else {
            foodPage = foodRepository.findAll(pageable);
        }

        return ResponseEntity.ok(foodPage);
    }

    // 2. LẤY THÔNG TIN 1 MÓN ĂN CỤ THỂ
    @GetMapping("/{id}")
    public ResponseEntity<Food> getFoodById(@PathVariable Long id) {
        Optional<Food> food = foodRepository.findById(id);
        if (food.isPresent()) {
            return ResponseEntity.ok(food.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. THÊM MÓN ĂN MỚI
    @PostMapping
    public Food createFood(@RequestBody Food food) {
        return foodRepository.save(food);
    }

    // 4. CẬP NHẬT MÓN ĂN
    @PutMapping("/{id}")
    public ResponseEntity<Food> updateFood(@PathVariable Long id, @RequestBody Food foodDetails) {
        Optional<Food> optionalFood = foodRepository.findById(id);

        if (optionalFood.isPresent()) {
            Food existingFood = optionalFood.get();
            existingFood.setName(foodDetails.getName());
            existingFood.setCurrentPrice(foodDetails.getCurrentPrice());
            existingFood.setImageURL(foodDetails.getImageURL());
            existingFood.setDescription(foodDetails.getDescription());
            existingFood.setIsAvailable(foodDetails.getIsAvailable());
            existingFood.setCategory(foodDetails.getCategory());

            return ResponseEntity.ok(foodRepository.save(existingFood));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. XÓA MÓN ĂN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // 6. ĐẢO TRẠNG THÁI TẠM NGƯNG / MỞ BÁN
    @PutMapping("/{id}/status")
    public ResponseEntity<Food> toggleFoodStatus(@PathVariable Long id) {
        Optional<Food> optionalFood = foodRepository.findById(id);

        if (optionalFood.isPresent()) {
            Food food = optionalFood.get();
            food.setIsAvailable(!food.getIsAvailable());
            return ResponseEntity.ok(foodRepository.save(food));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}