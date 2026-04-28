package com.campushub.scheduler;

import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.repository.ListingRepository;
import com.campushub.service.RecommendationService;
import com.campushub.service.TrendingListingService;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketplaceScheduler {

    private static final Set<ListingStatus> EXPIRABLE_STATUSES = EnumSet.of(ListingStatus.AVAILABLE, ListingStatus.INTERESTED);

    private final ListingRepository listingRepository;
    private final TrendingListingService trendingListingService;
    private final RecommendationService recommendationService;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireListings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        int expired = listingRepository.expireOldListings(cutoff, ListingStatus.EXPIRED, EXPIRABLE_STATUSES);
        log.info("Auto-expire task completed. Expired {} listings older than 7 days", expired);
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void refreshTrendingListings() {
        trendingListingService.refreshTrendingCache();
    }

    @Scheduled(cron = "0 30 0 * * ?")
    @Transactional
    public void refreshDailyRecommendations() {
        recommendationService.refreshDailyRecommendationSnapshots();
    }
}
