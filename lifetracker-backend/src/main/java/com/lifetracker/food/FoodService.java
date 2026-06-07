package com.lifetracker.food;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.food.dto.FoodRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final UserRepository userRepository;

    public FoodLog add(String email, FoodRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return foodRepository.save(FoodLog.builder()
                .user(user).meal(req.getMeal()).mealType(req.getMealType())
                .calories(req.getCalories()).restaurant(req.getRestaurant())
                .homeCooked(req.getHomeCooked() != null ? req.getHomeCooked() : false)
                .cuisine(req.getCuisine()).rating(req.getRating())
                .loggedOn(req.getLoggedOn() != null ? req.getLoggedOn() : LocalDate.now())
                .build());
    }

    public List<FoodLog> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return foodRepository.findByUserIdOrderByLoggedOnDesc(user.getId());
    }

    public void delete(String email, Long id) {
        FoodLog f = foodRepository.findById(id).orElseThrow();
        if (!f.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        foodRepository.delete(f);
    }
}
