package org.example.restaurantmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "table_id")
    private Long id;

    @Column(name = "table_number", nullable = false, length = 50)
    private String tableNumber; // VD: "Bàn 01"

    @Column(name = "status", length = 50)
    private String status = "Empty"; // "Empty", "Occupied"

    //Getter và Setter

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getTableNumber() {return tableNumber;}

    public void setTableNumber(String tableNumber) {this.tableNumber = tableNumber;}

    public String getStatus() {return status;}

    public void setStatus(String status) {this.status = status;}
}