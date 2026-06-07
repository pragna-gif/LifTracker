package com.lifetracker.ai;

import com.lifetracker.ai.dto.AiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=";

    private static final Map<String, String> PAGE_PROMPTS = Map.of(
        "expenses",  "You are a personal finance advisor. Analyze this expense data and give exactly 3 short, specific, actionable money-saving tips. Be direct and practical. Data: ",
        "dsa",       "You are a competitive programming coach. Analyze this DSA progress data and give exactly 3 specific tips to improve problem-solving skills, what topics to focus on, and how to build a streak. Data: ",
        "gym",       "You are a fitness coach. Analyze this gym session data and give exactly 3 specific workout improvement tips — muscle imbalances, frequency suggestions, or progression advice. Data: ",
        "content",   "You are a content strategy expert. Analyze this content pipeline data and give exactly 3 actionable tips to publish more consistently, grow audience, and clear the backlog. Data: ",
        "food",      "You are a nutritionist. Analyze this food log data and give exactly 3 specific healthy eating tips based on patterns you see — meal timing, nutrition balance, or habits. Data: ",
        "cafe",      "You are a productivity and lifestyle advisor. Analyze this café data and give exactly 3 fun tips — best cafés for deep work, what ratings to prioritize, or how to explore more. Data: ",
        "dashboard", "You are a life coach. Analyze this personal dashboard summary and give exactly 3 holistic insights — what's going well, what needs attention, and one motivational nudge. Data: "
    );

    public String getSuggestions(AiRequest request) {
        String prompt = PAGE_PROMPTS.getOrDefault(request.getPageType(),
                "Analyze this data and give 3 actionable improvement tips. Data: ")
                + request.getDataContext();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Gemini request format
        Map<String, Object> part    = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body    = Map.of("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    GEMINI_URL + apiKey, HttpMethod.POST, entity, Map.class);

            List<Map> candidates = (List<Map>) response.getBody().get("candidates");
            Map content0  = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content0.get("parts");
            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            return "Unable to get AI suggestions right now. Error: " + e.getMessage();
        }
    }
}
