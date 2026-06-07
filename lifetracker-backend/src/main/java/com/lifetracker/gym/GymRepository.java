package com.lifetracker.gym;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface GymRepository extends JpaRepository<GymSession, Long> {

    List<GymSession> findByUserIdOrderByWorkedOutOnDesc(Long userId);

    @Query("SELECT g.exercise, MAX(g.weightKg) FROM GymSession g WHERE g.user.id = :userId GROUP BY g.exercise ORDER BY MAX(g.weightKg) DESC")
    List<Object[]> personalRecords(Long userId);

    @Query("SELECT g.workedOutOn, COUNT(DISTINCT g.workedOutOn) FROM GymSession g WHERE g.user.id = :userId AND g.workedOutOn >= :since GROUP BY g.workedOutOn ORDER BY g.workedOutOn")
    List<Object[]> workoutFrequency(Long userId, LocalDate since);

    @Query("SELECT g.muscleGroup, COUNT(g) FROM GymSession g WHERE g.user.id = :userId GROUP BY g.muscleGroup")
    List<Object[]> countByMuscleGroup(Long userId);
}
