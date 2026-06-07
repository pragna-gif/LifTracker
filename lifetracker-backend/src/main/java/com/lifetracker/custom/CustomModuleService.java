package com.lifetracker.custom;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.custom.dto.CustomEntryRequest;
import com.lifetracker.custom.dto.CustomModuleRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomModuleService {

    private final CustomModuleRepository moduleRepository;
    private final CustomEntryRepository  entryRepository;
    private final UserRepository         userRepository;

    // ── Modules ─────────────────────────────────────────────────────────────

    public CustomModule createModule(String email, CustomModuleRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return moduleRepository.save(CustomModule.builder()
                .user(user)
                .name(req.getName())
                .icon(req.getIcon() != null ? req.getIcon() : "📋")
                .description(req.getDescription())
                .fields(req.getFields())
                .build());
    }

    public List<CustomModule> getModules(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return moduleRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void deleteModule(String email, Long id) {
        User user = userRepository.findByEmail(email).orElseThrow();
        CustomModule m = moduleRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        moduleRepository.delete(m);
    }

    // ── Entries ──────────────────────────────────────────────────────────────

    public CustomEntry addEntry(String email, CustomEntryRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        CustomModule module = moduleRepository.findByIdAndUserId(req.getModuleId(), user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        return entryRepository.save(CustomEntry.builder()
                .module(module)
                .user(user)
                .data(req.getData())
                .loggedOn(req.getLoggedOn() != null ? req.getLoggedOn() : LocalDate.now())
                .build());
    }

    public List<CustomEntry> getEntries(String email, Long moduleId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return entryRepository.findByModuleIdAndUserIdOrderByLoggedOnDescCreatedAtDesc(moduleId, user.getId());
    }

    public void deleteEntry(String email, Long id) {
        CustomEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entry not found"));
        if (!entry.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        entryRepository.delete(entry);
    }

    public Map<String, Object> getModuleSummary(String email, Long moduleId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        CustomModule module = moduleRepository.findByIdAndUserId(moduleId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        long totalEntries = entryRepository.countByModuleIdAndUserId(moduleId, user.getId());
        return Map.of(
                "module", Map.of("id", module.getId(), "name", module.getName(),
                                 "icon", module.getIcon(), "fields", module.getFields()),
                "totalEntries", totalEntries
        );
    }
}
