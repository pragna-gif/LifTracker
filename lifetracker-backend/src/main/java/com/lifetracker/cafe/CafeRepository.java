package com.lifetracker.cafe;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CafeRepository extends JpaRepository<Cafe, Long> {
    List<Cafe> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Cafe> findByUserIdAndCityIgnoreCaseOrderByCoffeeRatingDesc(Long userId, String city);
    List<Cafe> findByUserIdAndWorkFriendlyTrueOrderByCoffeeRatingDesc(Long userId);
    List<Cafe> findByUserIdAndWishlistTrue(Long userId);
}
