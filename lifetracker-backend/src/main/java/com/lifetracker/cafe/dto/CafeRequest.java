package com.lifetracker.cafe.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CafeRequest {
    @NotBlank private String name;
    private String location;
    private String city;
    @Min(1) @Max(5) private Integer wifiRating;
    @Min(1) @Max(5) private Integer coffeeRating;
    @Min(1) @Max(5) private Integer ambienceRating;
    private Boolean workFriendly;
    private String notes;
    private Boolean wishlist;
    private LocalDate visitedOn;
}
