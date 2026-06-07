package com.lifetracker.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    @NotNull @Positive
    private BigDecimal amount;

    @NotBlank
    private String category;

    private String note;
    private LocalDate spentOn;
}
