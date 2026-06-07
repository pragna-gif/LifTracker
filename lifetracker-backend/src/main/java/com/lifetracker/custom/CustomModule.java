package com.lifetracker.custom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "custom_modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomModule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String icon;

    private String description;

    // JSON array: [{"name":"field_key","label":"Display Label","type":"text|number|date|dropdown|boolean","options":["a","b"],"required":true}]
    @Column(nullable = false, columnDefinition = "TEXT")
    private String fields;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
