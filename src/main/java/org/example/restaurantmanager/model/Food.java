package org.example.restaurantmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "foods")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "current_price", nullable = false)
    private Integer currentPrice;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    // Nhiều món ăn thuộc về 1 Danh mục
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    //Getter và Setter
    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public Integer getCurrentPrice() {return currentPrice;}

    public void setCurrentPrice(Integer currentPrice) {this.currentPrice = currentPrice;}

    public String getImageURL() {return imageURL;}

    public void setImageURL(String imageURL) {this.imageURL = imageURL;}

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}

    public Boolean getIsAvailable() {return isAvailable;}

    public void setIsAvailable(Boolean available) {isAvailable = available;}

    public Category getCategory() {return category;}

    public void setCategory(Category category) {this.category = category;}
}