package com.lifetracker.gym;

import com.lifetracker.gym.dto.GymRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gym")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;

    @PostMapping
    public ResponseEntity<GymSession> add(@AuthenticationPrincipal UserDetails user,
                                          @Valid @RequestBody GymRequest req) {
        return ResponseEntity.ok(gymService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<GymSession>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(gymService.getAll(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        gymService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(gymService.getStats(user.getUsername()));
    }
}
