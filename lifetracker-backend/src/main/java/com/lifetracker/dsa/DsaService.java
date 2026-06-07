package com.lifetracker.dsa;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.dsa.dto.DsaRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DsaService {

    private final DsaRepository dsaRepository;
    private final UserRepository userRepository;

    public DsaProblem add(String email, DsaRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return dsaRepository.save(DsaProblem.builder()
                .user(user)
                .title(req.getTitle())
                .platform(req.getPlatform())
                .difficulty(req.getDifficulty())
                .topic(req.getTopic())
                .timeTaken(req.getTimeTaken())
                .notes(req.getNotes())
                .solvedOn(req.getSolvedOn() != null ? req.getSolvedOn() : LocalDate.now())
                .build());
    }

    public List<DsaProblem> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return dsaRepository.findByUserIdOrderBySolvedOnDesc(user.getId());
    }

    public void delete(String email, Long id) {
        DsaProblem p = dsaRepository.findById(id).orElseThrow();
        if (!p.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        dsaRepository.delete(p);
    }

    public Map<String, Object> getStats(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Long userId = user.getId();

        Map<String, Long> byTopic = new HashMap<>();
        dsaRepository.countByTopic(userId).forEach(r -> byTopic.put((String) r[0], (Long) r[1]));

        Map<String, Long> byDifficulty = new HashMap<>();
        dsaRepository.countByDifficulty(userId).forEach(r -> byDifficulty.put((String) r[0], (Long) r[1]));

        Map<String, Long> heatmap = new HashMap<>();
        dsaRepository.heatmapSince(userId, LocalDate.now().minusDays(90))
                .forEach(r -> heatmap.put(r[0].toString(), (Long) r[1]));

        return Map.of(
                "total", dsaRepository.countByUserId(userId),
                "byTopic", byTopic,
                "byDifficulty", byDifficulty,
                "heatmap", heatmap
        );
    }
}
