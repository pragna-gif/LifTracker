package com.lifetracker.dashboard;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.content.ContentRepository;
import com.lifetracker.dsa.DsaRepository;
import com.lifetracker.expense.ExpenseRepository;
import com.lifetracker.gym.GymRepository;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final DsaRepository dsaRepository;
    private final ContentRepository contentRepository;
    private final GymRepository gymRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long uid = user.getId();

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        BigDecimal monthlyExpenses = expenseRepository.totalBetween(uid, monthStart, today);
        long totalDsaSolved = dsaRepository.countByUserId(uid);
        long dsaThisWeek = dsaRepository.heatmapSince(uid, weekAgo).size();
        long publishedContent = contentRepository.countByUserIdAndStatus(uid, "PUBLISHED");
        long gymSessionsThisMonth = gymRepository.workoutFrequency(uid, monthStart).size();

        return ResponseEntity.ok(Map.of(
                "userName", user.getName(),
                "monthlyExpenses", monthlyExpenses != null ? monthlyExpenses : BigDecimal.ZERO,
                "totalDsaSolved", totalDsaSolved,
                "dsaThisWeek", dsaThisWeek,
                "publishedContent", publishedContent,
                "gymSessionsThisMonth", gymSessionsThisMonth
        ));
    }
}
