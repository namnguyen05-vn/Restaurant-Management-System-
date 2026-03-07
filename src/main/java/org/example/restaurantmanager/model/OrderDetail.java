package org.example.restaurantmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    private Long id;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Integer unitPrice; // Giá chốt lúc gọi món

    @Column(name = "note")
    private String note; // "Ít đá", "Không hành"

    @Column(name = "status", length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore // Tránh lặp vô hạn khi gọi API từ Order xuống
    private Order order;

    @ManyToOne
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    //Getter và Setter

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public Integer getQuantity() {return quantity;}

    public void setQuantity(Integer quantity) {this.quantity = quantity;}

    public Integer getUnitPrice() {return unitPrice;}

    public void setUnitPrice(Integer unitPrice) {this.unitPrice = unitPrice;}

    public String getNote() {return note;}

    public void setNote(String note) {this.note = note;}

    public String getStatus() {return status;}

    public void setStatus(String status) {this.status = status;}

    public Order getOrder() {return order;}

    public void setOrder(Order order) {this.order = order;}

    public Food getFood() {return food;}

    public void setFood(Food food) {this.food = food;}
}