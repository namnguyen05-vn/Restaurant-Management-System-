package org.example.restaurantmanager.dto;

public class InvoiceRequestDTO {
    private Long orderId;
    private Long staffId; // Người thu tiền
    private Integer discountAmount = 0; // Giảm giá (nếu có)
    private String paymentMethod = "Tiền mặt"; // "Tiền mặt" hoặc "Chuyển khoản"

    // --- GETTERS & SETTERS ---
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public Integer getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Integer discountAmount) { this.discountAmount = discountAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}