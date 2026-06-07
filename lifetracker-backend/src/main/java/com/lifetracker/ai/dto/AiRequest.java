package com.lifetracker.ai.dto;

import lombok.Data;

@Data
public class AiRequest {
    private String pageType;   // expenses, dsa, gym, content, cafe, food, dashboard
    private String dataContext; // JSON string of current page data summary
}
