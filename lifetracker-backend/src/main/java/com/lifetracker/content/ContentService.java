package com.lifetracker.content;

import com.lifetracker.auth.UserRepository;
import com.lifetracker.content.dto.ContentRequest;
import com.lifetracker.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    public ContentItem add(String email, ContentRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return contentRepository.save(ContentItem.builder()
                .user(user).title(req.getTitle()).platform(req.getPlatform())
                .status(req.getStatus() != null ? req.getStatus().toUpperCase() : "IDEA")
                .tags(req.getTags()).publishedDate(req.getPublishedDate())
                .viewCount(req.getViewCount() != null ? req.getViewCount() : 0)
                .build());
    }

    public List<ContentItem> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return contentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public ContentItem updateStatus(String email, Long id, String status) {
        ContentItem item = contentRepository.findById(id).orElseThrow();
        if (!item.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        item.setStatus(status.toUpperCase());
        return contentRepository.save(item);
    }

    public void delete(String email, Long id) {
        ContentItem c = contentRepository.findById(id).orElseThrow();
        if (!c.getUser().getEmail().equals(email)) throw new IllegalArgumentException("Forbidden");
        contentRepository.delete(c);
    }

    public Map<String, Object> getStats(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Long uid = user.getId();

        Map<String, Long> byPlatform = new HashMap<>();
        contentRepository.countByPlatform(uid).forEach(r -> byPlatform.put((String) r[0], (Long) r[1]));

        Map<String, Long> byStatus = new HashMap<>();
        contentRepository.countByStatus(uid).forEach(r -> byStatus.put((String) r[0], (Long) r[1]));

        return Map.of(
                "byPlatform", byPlatform,
                "byStatus", byStatus,
                "published", contentRepository.countByUserIdAndStatus(uid, "PUBLISHED")
        );
    }
}
