package com.lifetracker.content;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String platform;  // YouTube, Blog, LinkedIn, Twitter

    @Column(nullable = false)
    private String status = "IDEA";  // IDEA, DRAFTING, REVIEW, PUBLISHED

    private String tags;

    @Column(name = "published_date")
    private LocalDate publishedDate;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
