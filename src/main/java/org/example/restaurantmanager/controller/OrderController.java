package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.dto.OrderRequestDTO;
import org.example.restaurantmanager.dto.OrderItemDTO;
import org.example.restaurantmanager.model.*;
import org.example.restaurantmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private RestaurantTableRepository tableRepository;
    @Autowired private FoodRepository foodRepository;
    @Autowired private UserRepository userRepository;

    // 1. API TẠO ĐƠN HÀNG MỚI (TỪ FRONTEND GỬI LÊN)
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO request) {
        // Kiểm tra xem Bàn có tồn tại không
        Optional<RestaurantTable> tableOpt = tableRepository.findById(request.getTableId());
        if (tableOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Bàn không tồn tại!");
        }

        RestaurantTable table = tableOpt.get();

        // =======================================================
        // CHỐT CHẶN RACE CONDITION (BẢO VỆ CHỐNG ĐỤNG ĐỘ DỮ LIỆU)
        // Nếu bàn đã có người ngồi (Occupied) thì lập tức chặn lại và báo lỗi 400
        // =======================================================
        if ("Occupied".equals(table.getStatus())) {
            return ResponseEntity.badRequest().body("Bàn này đã có người đặt trước bạn một bước. Vui lòng chọn bàn khác!");
        }

        // Khởi tạo một Đơn hàng mới
        Order newOrder = new Order();
        newOrder.setTable(table);
        newOrder.setStatus("Pending"); // Trạng thái chờ bếp xác nhận
        newOrder.setNote(request.getNote());

        // Nếu có nhân viên tạo đơn thì gắn vào
        if (request.getUserId() != null) {
            userRepository.findById(request.getUserId()).ifPresent(newOrder::setUser);
        }

        int totalAmount = 0;
        List<OrderDetail> detailList = new ArrayList<>();

        // Lặp qua từng món ăn khách đặt
        for (OrderItemDTO itemDTO : request.getItems()) {
            Optional<Food> foodOpt = foodRepository.findById(itemDTO.getFoodId());
            if (foodOpt.isPresent()) {
                Food food = foodOpt.get();

                OrderDetail detail = new OrderDetail();
                detail.setOrder(newOrder); // Bắt buộc: Gắn chi tiết này thuộc về hóa đơn nào
                detail.setFood(food);
                detail.setQuantity(itemDTO.getQuantity());
                detail.setUnitPrice(food.getCurrentPrice()); // Chốt giá tiền tại thời điểm gọi
                detail.setNote(itemDTO.getNote());
                detail.setStatus("Pending");

                // Cộng dồn tổng tiền
                totalAmount += (food.getCurrentPrice() * itemDTO.getQuantity());
                detailList.add(detail);
            }
        }

        // Gắn danh sách chi tiết vào đơn hàng và lưu tổng tiền
        newOrder.setOrderDetails(detailList);
        newOrder.setTotalAmount(totalAmount);

        // Lưu đơn hàng vào Database
        Order savedOrder = orderRepository.save(newOrder);

        // Cập nhật trạng thái bàn thành "Có khách"
        table.setStatus("Occupied");
        tableRepository.save(table);

        return ResponseEntity.ok(savedOrder);
    }

    // 2. API LẤY DANH SÁCH ĐƠN HÀNG (DÀNH CHO NHÂN VIÊN/QUẢN LÝ)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 3. API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (VD: Bếp nấu xong -> "Served")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        return orderRepository.findById(orderId).map(order -> {

            // 1. Cập nhật trạng thái của Đơn hàng tổng (Order)
            order.setStatus(status);

            // 2. ĐỒNG BỘ TRẠNG THÁI XUỐNG TỪNG MÓN ĂN (OrderDetail)
            // Nếu đơn hàng đã phục vụ (Served) hoặc thanh toán (Paid)
            if (status.equals("Served") || status.equals("Paid")) {
                for (OrderDetail detail : order.getOrderDetails()) {
                    // Tránh ghi đè nếu có món nào đó đã bị báo Hết/Hủy (Cancelled) trước đó
                    if (!"Cancelled".equals(detail.getStatus())) {
                        detail.setStatus("Served");
                    }
                }
            }
            // Nếu khách hủy toàn bộ đơn hàng
            else if (status.equals("Cancelled")) {
                for (OrderDetail detail : order.getOrderDetails()) {
                    detail.setStatus("Cancelled");
                }
            }

            // 3. Giải phóng bàn nếu đơn hàng thanh toán xong (Paid) hoặc Bị hủy (Cancelled)
            if (status.equals("Paid") || status.equals("Cancelled")) {
                RestaurantTable table = order.getTable();
                table.setStatus("Empty");
                tableRepository.save(table);
            }

            // Lưu lại Order (Spring Boot sẽ tự động lưu luôn các OrderDetail đã bị đổi trạng thái ở trên)
            return ResponseEntity.ok(orderRepository.save(order));

        }).orElse(ResponseEntity.notFound().build());
    }
}