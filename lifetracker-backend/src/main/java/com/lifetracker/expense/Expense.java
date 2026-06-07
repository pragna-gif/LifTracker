package com.lifetracker.expense;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String category;   // Food, Transport, Shopping, Entertainment, Health, Other

    private String note;

    @Column(name = "spent_on", nullable = false)
    private LocalDate spentOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
