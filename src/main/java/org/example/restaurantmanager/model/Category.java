package org.example.restaurantmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(name = "category_name", nullable = false, length = 100)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;

    // 1 Danh mục có nhiều Món ăn
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Food> foods;

    //Getter và Setter
    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public Integer getDisplayOrder() {return displayOrder;}

    public void setDisplayOrder(Integer displayOrder) {this.displayOrder = displayOrder;}

    public List<Food> getFoods() {return foods;}

    public void setFoods(List<Food> foods) {this.foods = foods;}
}