package com.lifetracker.gym;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gym_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GymSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String exercise;

    @Column(name = "muscle_group")
    private String muscleGroup;

    private Integer sets;
    private Integer reps;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "duration_min")
    private Integer durationMin;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "worked_out_on", nullable = false)
    private LocalDate workedOutOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
