package org.example.restaurantmanager.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Column(name = "time_created", updatable = false)
    private LocalDateTime timeCreated;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // "Pending", "Served", "Paid"

    @Column(name = "total_amount")
    private Integer totalAmount = 0;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 1 Đơn hàng chứa nhiều chi tiết món ăn.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetails;

    // 1 Đơn hàng có 1 Hóa đơn
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Invoice invoice;

    @PrePersist
    protected void onCreate() { this.timeCreated = LocalDateTime.now(); }

    //Getter và Setter
    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public LocalDateTime getTimeCreated() {return timeCreated;}

    public void setTimeCreated(LocalDateTime timeCreated) {this.timeCreated = timeCreated;}

    public String getStatus() {return status;}

    public void setStatus(String status) {this.status = status;}

    public Integer getTotalAmount() {return totalAmount;}

    public void setTotalAmount(Integer totalAmount) {this.totalAmount = totalAmount;}

    public String getNote() {return note;}

    public void setNote(String note) {this.note = note;}

    public RestaurantTable getTable() {return table;}

    public void setTable(RestaurantTable table) {this.table = table;}

    public User getUser() {return user;}

    public void setUser(User user) {this.user = user;}

    public List<OrderDetail> getOrderDetails() {return orderDetails;}

    public void setOrderDetails(List<OrderDetail> orderDetails) {this.orderDetails = orderDetails;}

    public Invoice getInvoice() {return invoice;}

    public void setInvoice(Invoice invoice) {this.invoice = invoice;}
}