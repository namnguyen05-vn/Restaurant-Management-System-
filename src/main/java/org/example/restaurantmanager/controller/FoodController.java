package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.model.Food;
import org.example.restaurantmanager.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/foods") // Đây là đường dẫn gốc cho mọi thao tác với Món ăn
@CrossOrigin(origins = "*") //Cho phép giao diện web gọi API mà không bị chặn lỗi bảo mật CORS
public class FoodController {

    @Autowired
    private FoodRepository foodRepository; // Gọi anh "Thủ kho" lên để sai việc

    // 1. LẤY DANH SÁCH TOÀN BỘ MÓN ĂN (Sắp xếp lên bảng Admin)
    @GetMapping
    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    // 2. LẤY THÔNG TIN 1 MÓN ĂN CỤ THỂ (Dùng khi bấm nút "Sửa" trên web để hiện data cũ)
    @GetMapping("/{id}")
    public ResponseEntity<Food> getFoodById(@PathVariable Long id) {
        Optional<Food> food = foodRepository.findById(id);
        if (food.isPresent()) {
            return ResponseEntity.ok(food.get()); // Trả về mã 200 OK + Dữ liệu món ăn
        } else {
            return ResponseEntity.notFound().build(); // Trả về lỗi 404 Không tìm thấy
        }
    }

    // 3. THÊM MÓN ĂN MỚI (Dùng khi bấm nút "Lưu Dữ Liệu" ở Modal thêm món)
    @PostMapping
    public Food createFood(@RequestBody Food food) {
        // Dữ liệu JSON từ web gửi lên sẽ tự động biến thành đối tượng Food ở đây
        return foodRepository.save(food);
    }

    // 4. CẬP NHẬT MÓN ĂN (Sửa giá, sửa tên...)
    @PutMapping("/{id}")
    public ResponseEntity<Food> updateFood(@PathVariable Long id, @RequestBody Food foodDetails) {
        Optional<Food> optionalFood = foodRepository.findById(id);

        if (optionalFood.isPresent()) {
            Food existingFood = optionalFood.get();
            // Cập nhật các thông tin mới
            existingFood.setName(foodDetails.getName());
            existingFood.setCurrentPrice(foodDetails.getCurrentPrice());
            existingFood.setImageURL(foodDetails.getImageURL());
            existingFood.setDescription(foodDetails.getDescription());
            existingFood.setIsAvailable(foodDetails.getIsAvailable());
            existingFood.setCategory(foodDetails.getCategory()); // Cập nhật danh mục

            // Lưu lại vào DB
            return ResponseEntity.ok(foodRepository.save(existingFood));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. XÓA MÓN ĂN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodRepository.deleteById(id);
        return ResponseEntity.ok().build(); // Báo cáo xóa thành công (Mã 200)
    }
    // 6. ĐẢO TRẠNG THÁI TẠM NGƯNG / MỞ BÁN
    @PutMapping("/{id}/status")
    public ResponseEntity<Food> toggleFoodStatus(@PathVariable Long id) {
        Optional<Food> optionalFood = foodRepository.findById(id);

        if (optionalFood.isPresent()) {
            Food food = optionalFood.get();
            // Đảo ngược trạng thái: Đang true thành false, đang false thành true
            food.setIsAvailable(!food.getIsAvailable());

            // Lưu xuống Két sắt và trả về kết quả
            return ResponseEntity.ok(foodRepository.save(food));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}