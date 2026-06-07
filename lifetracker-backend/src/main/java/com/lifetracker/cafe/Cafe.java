package com.lifetracker.cafe;

import com.lifetracker.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cafes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cafe {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String location;
    private String city;

    @Column(name = "wifi_rating")
    private Integer wifiRating;

    @Column(name = "coffee_rating")
    private Integer coffeeRating;

    @Column(name = "ambience_rating")
    private Integer ambienceRating;

    @Column(name = "work_friendly")
    private Boolean workFriendly = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Boolean wishlist = false;

    @Column(name = "visited_on")
    private LocalDate visitedOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
