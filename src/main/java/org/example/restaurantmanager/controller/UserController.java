package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.dto.LoginRequestDTO;
import org.example.restaurantmanager.model.User;
import org.example.restaurantmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // 1. API ĐĂNG NHẬP (QUAN TRỌNG NHẤT)
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Kiểm tra tài khoản có bị khóa không
            if (!user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản của bạn đã bị khóa!");
            }

            // Kiểm tra mật khẩu (Lưu ý: equals() trong Java phân biệt chữ hoa/chữ thường)
            if (user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(user); // Trả về thông tin user và kết thúc hàm
            }
        }

        // Nếu không tìm thấy username HOẶC sai password, luồng chạy sẽ tự động rơi xuống đây:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tên đăng nhập hoặc mật khẩu!");
    }

    // ==========================================
    // 2. CÁC API QUẢN LÝ (DÀNH CHO ADMIN)
    // ==========================================

    // Lấy danh sách toàn bộ nhân viên
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy thông tin 1 nhân viên theo ID (Để điền vào form Sửa)
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tạo mới nhân viên / Quản lý
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    // Chỉnh sửa thông tin
    // Chỉnh sửa thông tin nhân viên
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {

            // Kiểm tra: Nếu đổi tên đăng nhập mới, phải đảm bảo tên này chưa ai dùng
            if (!user.getUsername().equals(userDetails.getUsername()) &&
                    userRepository.findByUsername(userDetails.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Tên đăng nhập này đã có người sử dụng!");
            }

            // Cập nhật toàn bộ thông tin
            user.setFullName(userDetails.getFullName());
            user.setUsername(userDetails.getUsername()); // Đã cho phép cập nhật Username
            user.setRole(userDetails.getRole());
            user.setIsActive(userDetails.getIsActive());

            // Chỉ cập nhật mật khẩu nếu ô mật khẩu không bị bỏ trống
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }
            return ResponseEntity.ok(userRepository.save(user));

        }).orElse(ResponseEntity.notFound().build());
    }

    // Đảo trạng thái Khóa / Mở khóa
    @PutMapping("/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setIsActive(!user.getIsActive());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Xóa nhân viên
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}