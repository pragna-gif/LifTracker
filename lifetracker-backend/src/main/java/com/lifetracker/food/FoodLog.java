package com.lifetracker.food;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String meal;

    @Column(name = "meal_type", nullable = false)
    private String mealType;  // Breakfast, Lunch, Dinner, Snack

    private Integer calories;
    private String restaurant;

    @Column(name = "home_cooked")
    private Boolean homeCooked = false;

    private String cuisine;
    private Integer rating;

    @Column(name = "logged_on", nullable = false)
    private LocalDate loggedOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
