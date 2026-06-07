package com.lifetracker.dsa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface DsaRepository extends JpaRepository<DsaProblem, Long> {

    List<DsaProblem> findByUserIdOrderBySolvedOnDesc(Long userId);

    @Query("SELECT d.topic, COUNT(d) FROM DsaProblem d WHERE d.user.id = :userId GROUP BY d.topic")
    List<Object[]> countByTopic(Long userId);

    @Query("SELECT d.difficulty, COUNT(d) FROM DsaProblem d WHERE d.user.id = :userId GROUP BY d.difficulty")
    List<Object[]> countByDifficulty(Long userId);

    @Query("SELECT d.solvedOn, COUNT(d) FROM DsaProblem d WHERE d.user.id = :userId AND d.solvedOn >= :since GROUP BY d.solvedOn ORDER BY d.solvedOn")
    List<Object[]> heatmapSince(Long userId, LocalDate since);

    long countByUserId(Long userId);
}
