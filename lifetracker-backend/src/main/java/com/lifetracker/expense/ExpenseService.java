package com.lifetracker.expense;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.expense.dto.ExpenseRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public Expense add(String email, ExpenseRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Expense expense = Expense.builder()
                .user(user)
                .amount(req.getAmount())
                .category(req.getCategory())
                .note(req.getNote())
                .spentOn(req.getSpentOn() != null ? req.getSpentOn() : LocalDate.now())
                .build();
        return expenseRepository.save(expense);
    }

    public List<Expense> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return expenseRepository.findByUserIdOrderBySpentOnDesc(user.getId());
    }

    public void delete(String email, Long id) {
        Expense expense = expenseRepository.findById(id).orElseThrow();
        if (!expense.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        expenseRepository.delete(expense);
    }

    public Map<String, Object> getSummary(String email, LocalDate from, LocalDate to) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Object[]> byCat = expenseRepository.sumByCategory(user.getId(), from, to);
        BigDecimal total = expenseRepository.totalBetween(user.getId(), from, to);

        Map<String, BigDecimal> categoryMap = new HashMap<>();
        for (Object[] row : byCat) {
            categoryMap.put((String) row[0], (BigDecimal) row[1]);
        }

        return Map.of(
                "total", total != null ? total : BigDecimal.ZERO,
                "byCategory", categoryMap,
                "from", from,
                "to", to
        );
    }
}
