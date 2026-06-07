package com.lifetracker.custom;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomModuleRepository extends JpaRepository<CustomModule, Long> {
    List<CustomModule> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CustomModule> findByIdAndUserId(Long id, Long userId);
}
