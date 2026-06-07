package com.lifetracker.content.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ContentRequest {
    @NotBlank private String title;
    @NotBlank private String platform;
    private String status;
    private String tags;
    private LocalDate publishedDate;
    private Integer viewCount;
}
