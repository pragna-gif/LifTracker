package com.lifetracker.content;

import com.lifetracker.content.dto.ContentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<ContentItem> add(@AuthenticationPrincipal UserDetails user,
                                           @Valid @RequestBody ContentRequest req) {
        return ResponseEntity.ok(contentService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<ContentItem>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(contentService.getAll(user.getUsername()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@AuthenticationPrincipal UserDetails user,
                                             @PathVariable Long id,
                                             @RequestParam String status) {
        contentService.updateStatus(user.getUsername(), id, status);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        contentService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(contentService.getStats(user.getUsername()));
    }
}
