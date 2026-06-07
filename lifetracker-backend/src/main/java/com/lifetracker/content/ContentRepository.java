package com.lifetracker.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContentRepository extends JpaRepository<ContentItem, Long> {

    List<ContentItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ContentItem> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    @Query("SELECT c.platform, COUNT(c) FROM ContentItem c WHERE c.user.id = :userId GROUP BY c.platform")
    List<Object[]> countByPlatform(Long userId);

    @Query("SELECT c.status, COUNT(c) FROM ContentItem c WHERE c.user.id = :userId GROUP BY c.status")
    List<Object[]> countByStatus(Long userId);

    long countByUserIdAndStatus(Long userId, String status);
}
