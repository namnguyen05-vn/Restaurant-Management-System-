package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.model.Invoice;
import org.example.restaurantmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.time.LocalDate;
import java.util.*;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dashboard") // 👈 Định tuyến thư mục gốc ở đây
public class DashboardController {
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private FoodRepository foodRepository;
    @Autowired private RestaurantTableRepository tableRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats(@RequestParam(defaultValue = "today") String range) {
        List<Invoice> allInvoices = invoiceRepository.findAll();
        LocalDate today = LocalDate.now();

        int revenue = 0;
        int orders = 0;

        for (Invoice inv : allInvoices) {
            if (inv.getPaymentTime() == null) continue;
            LocalDate pDate = inv.getPaymentTime().toLocalDate();
            boolean match = false;

            // Bộ lọc thời gian
            if ("today".equals(range)) {
                match = pDate.equals(today);
            } else if ("week".equals(range)) {
                match = pDate.isAfter(today.minusDays(7)) && !pDate.isAfter(today);
            } else if ("month".equals(range)) {
                match = pDate.getYear() == today.getYear() && pDate.getMonthValue() == today.getMonthValue();
            } else if ("year".equals(range)) {
                match = pDate.getYear() == today.getYear();
            }

            if (match) {
                // Đảm bảo không bị lỗi NullPointerException
                revenue += (inv.getFinalAmount() != null ? inv.getFinalAmount() : 0);
                orders++;
            }
        }

        long activeFoods = foodRepository.findAll().stream().filter(f -> f.getIsAvailable()).count();
        long occupiedTables = tableRepository.findAll().stream().filter(t -> "Occupied".equals(t.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenue", revenue);
        stats.put("orders", orders);
        stats.put("foods", activeFoods);
        stats.put("tables", occupiedTables);

        return stats;
    }

    // ====================================================
    // 2. Lấy dữ liệu vẽ biểu đồ Doanh thu (Hỗ trợ Dropdown)
    // ====================================================
    @GetMapping("/chart")
    public Map<String, Object> getChartData(@RequestParam(defaultValue = "today") String range) {
        List<Invoice> invoices = invoiceRepository.findAll();
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        LocalDate today = LocalDate.now();

        if ("year".equals(range)) {
            // Nhóm theo 12 tháng
            for (int i = 1; i <= 12; i++) {
                labels.add("Tháng " + i);
                final int month = i;
                int sum = invoices.stream()
                        .filter(inv -> inv.getPaymentTime() != null && inv.getPaymentTime().getYear() == today.getYear() && inv.getPaymentTime().getMonthValue() == month)
                        .mapToInt(inv -> inv.getFinalAmount() != null ? inv.getFinalAmount() : 0).sum();
                data.add(sum);
            }
        } else if ("month".equals(range)) {
            // Nhóm theo các ngày trong tháng
            int daysInMonth = today.lengthOfMonth();
            for (int i = 1; i <= daysInMonth; i++) {
                labels.add(i + "/" + today.getMonthValue());
                final int day = i;
                int sum = invoices.stream()
                        .filter(inv -> inv.getPaymentTime() != null && inv.getPaymentTime().getYear() == today.getYear() && inv.getPaymentTime().getMonthValue() == today.getMonthValue() && inv.getPaymentTime().getDayOfMonth() == day)
                        .mapToInt(inv -> inv.getFinalAmount() != null ? inv.getFinalAmount() : 0).sum();
                data.add(sum);
            }
        } else if ("week".equals(range)) {
            // Nhóm 7 ngày qua
            for (int i = 6; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                labels.add(d.getDayOfMonth() + "/" + d.getMonthValue());
                int sum = invoices.stream()
                        .filter(inv -> inv.getPaymentTime() != null && inv.getPaymentTime().toLocalDate().equals(d))
                        .mapToInt(inv -> inv.getFinalAmount() != null ? inv.getFinalAmount() : 0).sum();
                data.add(sum);
            }
        } else {
            // Hôm nay - Nhóm theo 24 khung giờ (từ 0h đến 23h)
            for (int i = 0; i <= 24; i+=2) {
                labels.add(i + "h"); // Hiển thị nhãn: 0h, 1h, 2h... 23h
                final int hour = i;

                int sum = invoices.stream()
                        .filter(inv -> inv.getPaymentTime() != null
                                && inv.getPaymentTime().toLocalDate().equals(today)
                                && inv.getPaymentTime().getHour() == hour) // Lọc thêm theo giờ
                        .mapToInt(inv -> inv.getFinalAmount() != null ? inv.getFinalAmount() : 0).sum();
                data.add(sum);
            }
        }

        // Trả về cả Nhãn (Trục X) và Dữ liệu (Trục Y)
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("data", data);
        return result;
    }
    @GetMapping("/food-stats-alltime")
    public ResponseEntity<List<Map<String, Object>>> getFoodStatsAllTime() {
        // Gọi hàm lấy cả Số lượng VÀ Doanh thu từ Repository
        List<Object[]> results = invoiceRepository.getFoodRevenueStatsAllTime();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);     // Cột 0: Tên món
            map.put("sold", row[1]);     // Cột 1: Số lượng bán
            map.put("revenue", row[2]);  // Cột 2: Doanh thu (MỚI THÊM)
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }
}