package com.campushub.service;

import com.campushub.dto.response.ListingResponse;
import com.campushub.entity.Listing;
import com.campushub.entity.RecommendationSnapshot;
import com.campushub.entity.User;
import com.campushub.entity.UserPreference;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.RecommendationSnapshotRepository;
import com.campushub.repository.UserRepository;
import com.campushub.repository.UserPreferenceRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private static final Set<ListingStatus> RECOMMENDABLE_STATUSES = EnumSet.of(
            ListingStatus.AVAILABLE,
            ListingStatus.INTERESTED
    );

    private final UserPreferenceRepository userPreferenceRepository;
    private final ListingRepository listingRepository;
    private final RecommendationSnapshotRepository recommendationSnapshotRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ListingViewAnalyticsService listingViewAnalyticsService;
    private final InterestAnalyticsService interestAnalyticsService;

    public void trackListingView(User user, Listing listing) {
        UserPreference preference = userPreferenceRepository.findByUserIdAndCategory(user.getId(), listing.getCategory())
                .orElseGet(() -> UserPreference.builder()
                        .user(user)
                        .category(listing.getCategory())
                        .viewCount(0)
                        .build());

        preference.setViewCount(preference.getViewCount() + 1);
        userPreferenceRepository.save(preference);
    }

    public List<ListingResponse> getRecommendedListings(User user) {
        LocalDate today = LocalDate.now();
        List<RecommendationSnapshot> snapshots = recommendationSnapshotRepository
                .findByUserIdAndSnapshotDateOrderByRankPositionAsc(user.getId(), today);

        if (!snapshots.isEmpty()) {
            return snapshots.stream()
                    .map(RecommendationSnapshot::getListing)
                    .filter(listing -> !listing.getOwner().getId().equals(user.getId()))
                    .map(listing -> toListingResponse(listing, buildReason(user, listing)))
                    .toList();
        }

        return buildRecommendationsForUser(user)
                .stream()
                .map(listing -> toListingResponse(listing, buildReason(user, listing)))
                .toList();
    }

    @Transactional
    public void refreshDailyRecommendationSnapshots() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll();

        for (User user : users) {
            recommendationSnapshotRepository.deleteByUserIdAndSnapshotDate(user.getId(), today);

            List<Listing> recommendations = buildRecommendationsForUser(user);
            List<RecommendationSnapshot> snapshots = new ArrayList<>();

            int rank = 1;
            for (Listing listing : recommendations) {
                snapshots.add(RecommendationSnapshot.builder()
                    .user(user)
                    .listing(listing)
                    .rankPosition(rank)
                    .snapshotDate(today)
                    .build());
                rank++;
            }

            if (!snapshots.isEmpty()) {
                recommendationSnapshotRepository.saveAll(snapshots);
            }
        }

        log.info("Daily recommendation snapshots refreshed for {} users", users.size());
            }

            private List<Listing> buildRecommendationsForUser(User user) {
        List<String> preferredCategories = userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(user.getId())
                .stream()
                .map(UserPreference::getCategory)
                .toList();

        if (preferredCategories.isEmpty()) {
            return listingRepository.findByStatusInOrderByCreatedAtDesc(RECOMMENDABLE_STATUSES)
                    .stream()
                    .filter(listing -> !listing.getOwner().getId().equals(user.getId()))
                    .limit(10)
                    .toList();
        }

        return listingRepository.findByStatusInOrderByCreatedAtDesc(RECOMMENDABLE_STATUSES)
                .stream()
                .filter(listing -> preferredCategories.contains(listing.getCategory()))
                .filter(listing -> !listing.getOwner().getId().equals(user.getId()))
                .limit(10)
                .toList();
    }

        @Transactional
    public void onListingInterest(Long listingId, Long interestedUserId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        User user = userRepository.findById(interestedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + interestedUserId));

        UserPreference preference = userPreferenceRepository.findByUserIdAndCategory(user.getId(), listing.getCategory())
            .orElseGet(() -> UserPreference.builder()
                .user(user)
                .category(listing.getCategory())
                .viewCount(0)
                .build());

        preference.setViewCount(preference.getViewCount() + 2);
        userPreferenceRepository.save(preference);

        log.debug("Recommendation preference boosted from listing interest. listingId={}, userId={}", listingId, interestedUserId);
    }

    private ListingResponse toListingResponse(Listing listing, String reason) {
        long viewCount = listingViewAnalyticsService.getViewCount(listing);
        long interestCount = interestAnalyticsService.getInterestCount(listing.getId());
        Integer daysRemaining = calculateDaysRemaining(listing);

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .category(listing.getCategory())
                .imageUrl(listing.getImageUrl())
                .status(listing.getStatus())
                .createdAt(listing.getCreatedAt())
                .owner(userService.toUserResponse(listing.getOwner()))
                .reason(reason)
                .badges(buildBadges(listing, interestCount))
                .interestCount(interestCount)
                .viewCount(viewCount)
                .daysRemaining(daysRemaining)
                .urgencyText(buildUrgencyText(listing, interestCount, daysRemaining))
                .build();
    }

    private String buildReason(User user, Listing listing) {
        List<String> preferredCategories = userPreferenceRepository.findTop3ByUserIdOrderByViewCountDesc(user.getId())
                .stream()
                .map(UserPreference::getCategory)
                .toList();

        if (!preferredCategories.isEmpty() && preferredCategories.contains(listing.getCategory())) {
            return "Based on your interest in " + listing.getCategory();
        }

        if (interestAnalyticsService.getInterestCount(listing.getId()) > 4) {
            return "Popular with students right now";
        }

        return "Fresh from campus";
    }

    private List<String> buildBadges(Listing listing, long interestCount) {
        List<String> badges = new ArrayList<>();
        if (interestCount > 10) {
            badges.add("Trending");
        }
        if (interestCount > 4) {
            badges.add("High Interest");
        }
        if (listing.getCreatedAt() != null && ChronoUnit.HOURS.between(listing.getCreatedAt(), LocalDateTime.now()) < 24) {
            badges.add("Recently Added");
        }
        return badges;
    }

    private Integer calculateDaysRemaining(Listing listing) {
        if (listing.getCreatedAt() == null) {
            return null;
        }

        long ageDays = ChronoUnit.DAYS.between(listing.getCreatedAt(), LocalDateTime.now());
        long remaining = 7 - ageDays;
        return (int) Math.max(remaining, 0);
    }

    private String buildUrgencyText(Listing listing, long interestCount, Integer daysRemaining) {
        if (listing.getStatus() == ListingStatus.SOLD) {
            return "Sold";
        }

        if (daysRemaining != null && daysRemaining <= 2) {
            return "Expires in " + daysRemaining + " days";
        }

        if (interestCount > 0) {
            return interestCount + " people interested";
        }

        return null;
    }
}
