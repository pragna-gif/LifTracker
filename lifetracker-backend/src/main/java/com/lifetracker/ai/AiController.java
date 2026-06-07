package com.lifetracker.ai;

import com.lifetracker.ai.dto.AiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/suggest")
    public ResponseEntity<Map<String, String>> suggest(@RequestBody AiRequest request) {
        String suggestions = aiService.getSuggestions(request);
        return ResponseEntity.ok(Map.of("suggestions", suggestions));
    }
}
