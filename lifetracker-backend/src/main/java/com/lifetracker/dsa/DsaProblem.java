package com.lifetracker.dsa;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dsa_problems")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DsaProblem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String platform;   // LeetCode, GFG, Codeforces, HackerRank

    @Column(nullable = false)
    private String difficulty; // Easy, Medium, Hard

    @Column(nullable = false)
    private String topic;      // Arrays, DP, Graphs, Trees, etc.

    @Column(name = "time_taken")
    private Integer timeTaken; // minutes

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "solved_on", nullable = false)
    private LocalDate solvedOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
