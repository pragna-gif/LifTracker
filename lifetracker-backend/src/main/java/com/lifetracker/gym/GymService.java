package com.lifetracker.gym;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.gym.dto.GymRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GymService {

    private final GymRepository gymRepository;
    private final UserRepository userRepository;

    public GymSession add(String email, GymRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return gymRepository.save(GymSession.builder()
                .user(user)
                .exercise(req.getExercise())
                .muscleGroup(req.getMuscleGroup())
                .sets(req.getSets())
                .reps(req.getReps())
                .weightKg(req.getWeightKg())
                .durationMin(req.getDurationMin())
                .notes(req.getNotes())
                .workedOutOn(req.getWorkedOutOn() != null ? req.getWorkedOutOn() : LocalDate.now())
                .build());
    }

    public List<GymSession> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return gymRepository.findByUserIdOrderByWorkedOutOnDesc(user.getId());
    }

    public void delete(String email, Long id) {
        GymSession g = gymRepository.findById(id).orElseThrow();
        if (!g.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        gymRepository.delete(g);
    }

    public Map<String, Object> getStats(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Long uid = user.getId();

        Map<String, Object> prs = new HashMap<>();
        gymRepository.personalRecords(uid).forEach(r -> prs.put((String) r[0], r[1]));

        Map<String, Long> muscleGroups = new HashMap<>();
        gymRepository.countByMuscleGroup(uid).forEach(r -> muscleGroups.put((String) r[0], (Long) r[1]));

        List<Object[]> freq = gymRepository.workoutFrequency(uid, LocalDate.now().minusDays(30));

        return Map.of("personalRecords", prs, "muscleGroups", muscleGroups, "recentFrequency", freq.size());
    }
}
