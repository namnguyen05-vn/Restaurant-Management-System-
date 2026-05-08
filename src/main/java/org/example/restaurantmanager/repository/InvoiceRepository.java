package org.example.restaurantmanager.repository;

import org.example.restaurantmanager.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // HÀM TÌM TOP 5 MÓN BÁN CHẠY NHẤT THEO THỜI GIAN
    @Query(value = "SELECT f.name AS foodName, SUM(od.quantity) AS totalSold " +
            "FROM invoices i " +
            "JOIN orders o ON i.order_id =o.order_id " +
            "JOIN order_details od ON od.order_id = o.order_id " +
            "JOIN foods f ON od.food_id = f.food_id " +
            "GROUP BY f.food_id, f.name " +
            "ORDER BY totalSold DESC LIMIT 5", nativeQuery = true)
    List<Object[]> getTop5BestSellingFoodsAllTime();
    // Hàm mới: Tính cả Số lượng bán và Tổng tiền (Doanh thu)
    @Query(value = "SELECT f.name AS foodName, SUM(od.quantity) AS totalSold, " +
            "SUM(od.quantity * od.unit_price) AS totalRevenue " +
            "FROM invoices i " +
            "JOIN orders o ON i.order_id = o.order_id " +
            "JOIN order_details od ON od.order_id = o.order_id " +
            "JOIN foods f ON od.food_id = f.food_id " +
            "WHERE o.status = 'Paid'  " +
            "GROUP BY f.food_id, f.name " +
            "ORDER BY totalSold DESC", nativeQuery = true)
    List<Object[]> getFoodRevenueStatsAllTime();
    Page<Invoice> findByStaff_FullNameContainingIgnoreCase(String staffName, Pageable pageable);
}