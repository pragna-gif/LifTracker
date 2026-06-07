package com.lifetracker.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderBySpentOnDesc(Long userId);

    List<Expense> findByUserIdAndSpentOnBetweenOrderBySpentOnDesc(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.spentOn BETWEEN :from AND :to GROUP BY e.category")
    List<Object[]> sumByCategory(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.spentOn BETWEEN :from AND :to")
    BigDecimal totalBetween(Long userId, LocalDate from, LocalDate to);
}
