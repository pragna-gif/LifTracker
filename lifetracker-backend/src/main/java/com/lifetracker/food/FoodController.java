package com.lifetracker.food;

import com.lifetracker.food.dto.FoodRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public ResponseEntity<FoodLog> add(@AuthenticationPrincipal UserDetails user,
                                       @Valid @RequestBody FoodRequest req) {
        return ResponseEntity.ok(foodService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<FoodLog>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(foodService.getAll(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        foodService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
