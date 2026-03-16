package org.example.restaurantmanager.dto;

public class OrderItemDTO {
    private Long foodId;
    private Integer quantity;
    private String note; // Ghi chú riêng cho món (VD: Ít đá, không hành)

    // Getter và Setter
    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}