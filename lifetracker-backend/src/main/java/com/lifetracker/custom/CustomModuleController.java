package com.lifetracker.custom;

import com.lifetracker.custom.dto.CustomEntryRequest;
import com.lifetracker.custom.dto.CustomModuleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/custom")
@RequiredArgsConstructor
public class CustomModuleController {

    private final CustomModuleService service;

    // ── Modules ──────────────────────────────────────────────────────────────

    @PostMapping("/modules")
    public ResponseEntity<CustomModule> createModule(@AuthenticationPrincipal UserDetails user,
                                                     @Valid @RequestBody CustomModuleRequest req) {
        return ResponseEntity.ok(service.createModule(user.getUsername(), req));
    }

    @GetMapping("/modules")
    public ResponseEntity<List<CustomModule>> getModules(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.getModules(user.getUsername()));
    }

    @DeleteMapping("/modules/{id}")
    public ResponseEntity<Void> deleteModule(@AuthenticationPrincipal UserDetails user,
                                             @PathVariable Long id) {
        service.deleteModule(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/modules/{id}/summary")
    public ResponseEntity<Map<String, Object>> summary(@AuthenticationPrincipal UserDetails user,
                                                       @PathVariable Long id) {
        return ResponseEntity.ok(service.getModuleSummary(user.getUsername(), id));
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    @PostMapping("/entries")
    public ResponseEntity<CustomEntry> addEntry(@AuthenticationPrincipal UserDetails user,
                                                @Valid @RequestBody CustomEntryRequest req) {
        return ResponseEntity.ok(service.addEntry(user.getUsername(), req));
    }

    @GetMapping("/modules/{moduleId}/entries")
    public ResponseEntity<List<CustomEntry>> getEntries(@AuthenticationPrincipal UserDetails user,
                                                        @PathVariable Long moduleId) {
        return ResponseEntity.ok(service.getEntries(user.getUsername(), moduleId));
    }

    @DeleteMapping("/entries/{id}")
    public ResponseEntity<Void> deleteEntry(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable Long id) {
        service.deleteEntry(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
