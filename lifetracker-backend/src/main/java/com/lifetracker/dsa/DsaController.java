package com.lifetracker.dsa;

import com.lifetracker.dsa.dto.DsaRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dsa")
@RequiredArgsConstructor
public class DsaController {

    private final DsaService dsaService;

    @PostMapping
    public ResponseEntity<DsaProblem> add(@AuthenticationPrincipal UserDetails user,
                                          @Valid @RequestBody DsaRequest req) {
        return ResponseEntity.ok(dsaService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<DsaProblem>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(dsaService.getAll(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        dsaService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(dsaService.getStats(user.getUsername()));
    }
}
