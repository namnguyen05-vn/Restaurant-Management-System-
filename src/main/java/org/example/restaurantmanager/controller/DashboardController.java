package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.model.Invoice;
import org.example.restaurantmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private FoodRepository foodRepository;
    @Autowired private RestaurantTableRepository tableRepository;

    // 1. Lấy 4 con số tổng quan cho hôm nay
    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        List<Invoice> allInvoices = invoiceRepository.findAll();
        LocalDate today = LocalDate.now();

        int todayRevenue = 0;
        int todayOrders = 0;

        for (Invoice inv : allInvoices) {
            // Chỉ cộng tiền các hóa đơn xuất trong ngày hôm nay
            if (inv.getPaymentTime().toLocalDate().equals(today)) {
                todayRevenue += inv.getFinalAmount();
                todayOrders++;
            }
        }

        // Đếm số món ăn đang mở bán và số bàn đang có khách
        long activeFoods = foodRepository.findAll().stream().filter(f -> f.getIsAvailable()).count();
        long occupiedTables = tableRepository.findAll().stream().filter(t -> "Occupied".equals(t.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenue", todayRevenue);
        stats.put("orders", todayOrders);
        stats.put("foods", activeFoods);
        stats.put("tables", occupiedTables);

        return stats;
    }

    // 2. Lấy mảng doanh thu 7 ngày qua để vẽ biểu đồ
    @GetMapping("/chart")
    public List<Integer> getChartData() {
        List<Invoice> allInvoices = invoiceRepository.findAll();
        LocalDate today = LocalDate.now();

        // Khởi tạo mảng 7 ngày với giá trị 0đ
        List<Integer> chartData = new ArrayList<>(Collections.nCopies(7, 0));

        for (Invoice inv : allInvoices) {
            LocalDate paymentDate = inv.getPaymentTime().toLocalDate();

            // Xếp hóa đơn vào đúng ngày trong tuần qua
            for (int i = 0; i < 7; i++) {
                LocalDate targetDate = today.minusDays(6 - i);
                if (paymentDate.equals(targetDate)) {
                    chartData.set(i, chartData.get(i) + inv.getFinalAmount());
                    break;
                }
            }
        }
        return chartData;
    }
}