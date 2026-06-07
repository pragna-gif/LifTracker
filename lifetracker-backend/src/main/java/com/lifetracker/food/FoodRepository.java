package com.lifetracker.food;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface FoodRepository extends JpaRepository<FoodLog, Long> {

    List<FoodLog> findByUserIdOrderByLoggedOnDesc(Long userId);

    @Query("SELECT f.loggedOn, SUM(f.calories) FROM FoodLog f WHERE f.user.id = :userId AND f.loggedOn >= :since GROUP BY f.loggedOn ORDER BY f.loggedOn")
    List<Object[]> caloriesByDay(Long userId, LocalDate since);

    @Query("SELECT f.cuisine, COUNT(f) FROM FoodLog f WHERE f.user.id = :userId AND f.cuisine IS NOT NULL GROUP BY f.cuisine ORDER BY COUNT(f) DESC")
    List<Object[]> topCuisines(Long userId);
}
