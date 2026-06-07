package com.lifetracker.dsa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DsaRequest {
    @NotBlank private String title;
    @NotBlank private String platform;
    @NotBlank private String difficulty;
    @NotBlank private String topic;
    private Integer timeTaken;
    private String notes;
    private LocalDate solvedOn;
}
