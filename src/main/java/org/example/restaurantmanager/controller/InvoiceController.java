package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.dto.InvoiceRequestDTO;
import org.example.restaurantmanager.model.*;
import org.example.restaurantmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private RestaurantTableRepository tableRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Invoice>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword) {

        // Thêm Sort để hóa đơn mới nhất luôn nằm trên cùng
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Invoice> invoicePage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            // Giả sử dùng tìm kiếm theo tên nhân viên qua bảng liên kết
            invoicePage = invoiceRepository.findByStaff_FullNameContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            invoicePage = invoiceRepository.findAll(pageable);
        }
        return ResponseEntity.ok(invoicePage);
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequestDTO request) {
        return orderRepository.findById(request.getOrderId()).map(order -> {

            // 1. Chặn lỗi thanh toán 2 lần
            if ("Paid".equals(order.getStatus())) {
                return ResponseEntity.badRequest().body("Đơn hàng này đã được thanh toán!");
            }

            // 2. Tạo hóa đơn mới
            Invoice invoice = new Invoice();
            invoice.setOrder(order);
            invoice.setSubtotal(order.getTotalAmount());
            invoice.setDiscountAmount(request.getDiscountAmount());

            // Toán học cơ bản: Số tiền cuối cùng = Tổng đơn - Giảm giá
            invoice.setFinalAmount(order.getTotalAmount() - request.getDiscountAmount());
            invoice.setPaymentMethod(request.getPaymentMethod());

            // Gắn tên nhân viên thu tiền
            if (request.getStaffId() != null) {
                userRepository.findById(request.getStaffId()).ifPresent(invoice::setStaff);
            }

            // Lưu hóa đơn
            Invoice savedInvoice = invoiceRepository.save(invoice);

            // 3. Cập nhật trạng thái Đơn hàng thành Đã thanh toán (Paid)
            order.setStatus("Paid");
            orderRepository.save(order);

            // 4. Giải phóng Bàn ăn về trạng thái Trống (Empty)
            RestaurantTable table = order.getTable();
            table.setStatus("Empty");
            tableRepository.save(table);

            return ResponseEntity.ok(savedInvoice);

        }).orElse(ResponseEntity.notFound().build());
    }
}