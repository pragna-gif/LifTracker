package com.lifetracker.cafe;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.cafe.dto.CafeRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CafeService {

    private final CafeRepository cafeRepository;
    private final UserRepository userRepository;

    public Cafe add(String email, CafeRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cafeRepository.save(Cafe.builder()
                .user(user).name(req.getName()).location(req.getLocation())
                .city(req.getCity()).wifiRating(req.getWifiRating())
                .coffeeRating(req.getCoffeeRating()).ambienceRating(req.getAmbienceRating())
                .workFriendly(req.getWorkFriendly() != null ? req.getWorkFriendly() : false)
                .notes(req.getNotes())
                .wishlist(req.getWishlist() != null ? req.getWishlist() : false)
                .visitedOn(req.getVisitedOn())
                .build());
    }

    public List<Cafe> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cafeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Cafe> getWorkFriendly(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cafeRepository.findByUserIdAndWorkFriendlyTrueOrderByCoffeeRatingDesc(user.getId());
    }

    public List<Cafe> getWishlist(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cafeRepository.findByUserIdAndWishlistTrue(user.getId());
    }

    public void delete(String email, Long id) {
        Cafe c = cafeRepository.findById(id).orElseThrow();
        if (!c.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        cafeRepository.delete(c);
    }
}
