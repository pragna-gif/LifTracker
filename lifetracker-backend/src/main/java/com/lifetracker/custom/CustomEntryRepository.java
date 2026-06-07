package com.lifetracker.custom;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomEntryRepository extends JpaRepository<CustomEntry, Long> {
    List<CustomEntry> findByModuleIdAndUserIdOrderByLoggedOnDescCreatedAtDesc(Long moduleId, Long userId);
    long countByModuleIdAndUserId(Long moduleId, Long userId);
}
