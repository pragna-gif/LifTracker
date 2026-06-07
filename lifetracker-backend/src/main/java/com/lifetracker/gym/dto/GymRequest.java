package com.lifetracker.gym.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GymRequest {
    @NotBlank private String exercise;
    private String muscleGroup;
    private Integer sets;
    private Integer reps;
    private BigDecimal weightKg;
    private Integer durationMin;
    private String notes;
    private LocalDate workedOutOn;
}
