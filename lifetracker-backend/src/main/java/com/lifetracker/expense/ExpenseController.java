package com.lifetracker.expense;

import com.lifetracker.expense.dto.ExpenseRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> add(@AuthenticationPrincipal UserDetails user,
                                       @Valid @RequestBody ExpenseRequest req) {
        return ResponseEntity.ok(expenseService.add(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(expenseService.getAll(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        expenseService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().withDayOfMonth(1)}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(expenseService.getSummary(user.getUsername(), from, to));
    }
}
