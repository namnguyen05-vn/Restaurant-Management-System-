package org.example.restaurantmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long id;

    @Column(name = "payment_time", updatable = false)
    private LocalDateTime paymentTime;

    @Column(name = "subtotal")
    private Integer subtotal = 0;

    @Column(name = "discount_amount")
    private Integer discountAmount = 0;

    @Column(name = "final_amount")
    private Integer finalAmount = 0;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Quan hệ 1-1 với Order
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore // Tránh lặp vô hạn với Order
    private Order order;

    // Nhân viên nào thu tiền
    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staff;

    @PrePersist
    protected void onCreate() { this.paymentTime = LocalDateTime.now(); }

    //Getters và Setters
    @JsonProperty("orderId")
    public Long getOrderIdForJson() {
        return (order != null) ? order.getId() : null;
    }
    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public LocalDateTime getPaymentTime() {return paymentTime;}

    public void setPaymentTime(LocalDateTime paymentTime) {this.paymentTime = paymentTime;}

    public Integer getSubtotal() {return subtotal;}

    public void setSubtotal(Integer subtotal) {this.subtotal = subtotal;}

    public Integer getDiscountAmount() {return discountAmount;}

    public void setDiscountAmount(Integer discountAmount) {this.discountAmount = discountAmount;}

    public Integer getFinalAmount() {return finalAmount;}

    public void setFinalAmount(Integer finalAmount) {this.finalAmount = finalAmount;}

    public String getPaymentMethod() {return paymentMethod;}

    public void setPaymentMethod(String paymentMethod) {this.paymentMethod = paymentMethod;}

    public Order getOrder() {return order;}

    public void setOrder(Order order) {this.order = order;}

    public User getStaff() {return staff;}

    public void setStaff(User staff) {this.staff = staff;}
}