package com.lifetracker.custom.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomModuleRequest {
    @NotBlank private String name;
    private String icon;
    private String description;
    @NotBlank private String fields; // JSON string of field definitions
}
