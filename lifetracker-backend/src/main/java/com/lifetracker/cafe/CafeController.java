package com.lifetracker.cafe;

import com.lifetracker.cafe.dto.CafeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafes")
@RequiredArgsConstructor
public class CafeController {

    private final CafeService cafeService;

    @PostMapping
    public ResponseEntity<Cafe> add(@AuthenticationPrincipal UserDetails user,
                                    @Valid @RequestBody CafeRequest req) {
        return ResponseEntity.ok(cafeService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<Cafe>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cafeService.getAll(user.getUsername()));
    }

    @GetMapping("/work-friendly")
    public ResponseEntity<List<Cafe>> getWorkFriendly(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cafeService.getWorkFriendly(user.getUsername()));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<Cafe>> getWishlist(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cafeService.getWishlist(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        cafeService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
