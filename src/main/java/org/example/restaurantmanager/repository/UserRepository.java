package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm User theo tên đăng nhập (Dùng để làm chức năng Đăng nhập sau này)
    Optional<User> findByUsername(String username);
}