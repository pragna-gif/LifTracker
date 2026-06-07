package com.lifetracker.custom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomEntry {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CustomModule module;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // JSON object: {"field_key": "value", ...}
    @Column(nullable = false, columnDefinition = "TEXT")
    private String data;

    @Column(name = "logged_on", nullable = false)
    private LocalDate loggedOn = LocalDate.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
