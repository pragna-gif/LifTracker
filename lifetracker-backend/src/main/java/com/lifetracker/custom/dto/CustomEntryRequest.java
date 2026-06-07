package com.lifetracker.custom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomEntryRequest {
    @NotNull  private Long moduleId;
    @NotBlank private String data;    // JSON object of field values
    private LocalDate loggedOn;
}
