package org.example.restaurantmanager.dto;

import java.util.List;

public class OrderRequestDTO {
    private Long tableId;
    private Long userId; // ID của Nhân viên tạo đơn (Nếu có)
    private String note; // Ghi chú chung của cả bàn
    private List<OrderItemDTO> items; // Danh sách các món ăn

    // Getter và Setter
    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
}