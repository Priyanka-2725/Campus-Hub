package com.campushub.controller;

import com.campushub.dto.response.DashboardStatsResponse;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.repository.CollabPostRepository;
import com.campushub.repository.EventRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.NotificationRepository;
import com.campushub.repository.UserPreferenceRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final EventRepository eventRepository;
    private final CollabPostRepository collabPostRepository;
    private final NotificationRepository notificationRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserService userService;

    @GetMapping("/public-stats")
    public ResponseEntity<DashboardStatsResponse> getPublicStats() {
        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .activeListings(listingRepository.countByStatus(ListingStatus.AVAILABLE))
                .totalEvents(eventRepository.count())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        Long currentUserId = userService.getCurrentAuthenticatedUser().getId();

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .activeListings(listingRepository.countByStatus(ListingStatus.AVAILABLE))
                .soldListings(listingRepository.countByStatus(ListingStatus.SOLD))
                .totalEvents(eventRepository.count())
                .unreadNotifications(notificationRepository.countByUserIdAndIsReadFalse(currentUserId))
                .totalCollaborations(collabPostRepository.count())
                .topCategory(resolveTopCategory(currentUserId))
                .bestTimeToPost(resolveBestTimeToPost(currentUserId))
                .insightHeadline(resolveInsightHeadline(currentUserId))
                .insightDetail(resolveInsightDetail(currentUserId))
                .build();

        return ResponseEntity.ok(response);
    }

    private String resolveTopCategory(Long userId) {
        return userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(userId)
                .stream()
                .findFirst()
                .map(preference -> preference.getCategory())
                .orElse("General");
    }

    private String resolveBestTimeToPost(Long userId) {
        long categoryCount = userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(userId).size();
        return categoryCount > 0 ? "Evening" : "Afternoon";
    }

    private String resolveInsightHeadline(Long userId) {
        List<String> categories = userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(userId)
                .stream()
                .map(preference -> preference.getCategory())
                .toList();

        if (!categories.isEmpty()) {
            return "Your listings are getting high attention";
        }

        return "Your campus profile is warming up";
    }

    private String resolveInsightDetail(Long userId) {
        List<String> categories = userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(userId)
                .stream()
                .map(preference -> preference.getCategory())
                .toList();

        if (!categories.isEmpty()) {
            return "You get more responses in " + categories.get(0) + ".";
        }

        return "Keep browsing and posting to unlock personalized insights.";
    }
}
