package com.lifetracker.food.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FoodRequest {
    @NotBlank private String meal;
    @NotBlank private String mealType;
    private Integer calories;
    private String restaurant;
    private Boolean homeCooked;
    private String cuisine;
    private Integer rating;
    private LocalDate loggedOn;
}
