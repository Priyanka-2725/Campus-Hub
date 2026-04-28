package com.campushub.service;

import com.campushub.entity.Listing;
import com.campushub.entity.ListingInterestAnalytics;
import com.campushub.entity.ListingViewAnalytics;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.repository.ListingInterestAnalyticsRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.ListingViewAnalyticsRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingListingService {

    private static final Set<ListingStatus> TRENDING_STATUSES = EnumSet.of(ListingStatus.AVAILABLE, ListingStatus.INTERESTED);

    private final ListingRepository listingRepository;
    private final ListingViewAnalyticsRepository listingViewAnalyticsRepository;
    private final ListingInterestAnalyticsRepository listingInterestAnalyticsRepository;

    private volatile List<Long> cachedTrendingListingIds = List.of();

    public List<Listing> getTrendingListings(int limit) {
        List<Listing> listings = getListingsFromCache(limit);
        if (!listings.isEmpty()) {
            return listings;
        }
        return computeTrendingListings(limit);
    }

    public void refreshTrendingCache() {
        List<Listing> trending = computeTrendingListings(20);
        cachedTrendingListingIds = trending.stream().map(Listing::getId).toList();
        log.info("Refreshed trending listing cache with {} items", cachedTrendingListingIds.size());
    }

    private List<Listing> getListingsFromCache(int limit) {
        if (cachedTrendingListingIds.isEmpty()) {
            return List.of();
        }

        List<Listing> cachedListings = listingRepository.findAllById(cachedTrendingListingIds);
        Map<Long, Listing> listingMap = new HashMap<>();
        for (Listing listing : cachedListings) {
            listingMap.put(listing.getId(), listing);
        }

        List<Listing> ordered = new ArrayList<>();
        for (Long listingId : cachedTrendingListingIds) {
            Listing listing = listingMap.get(listingId);
            if (listing != null && TRENDING_STATUSES.contains(listing.getStatus())) {
                ordered.add(listing);
            }
            if (ordered.size() >= limit) {
                break;
            }
        }

        return ordered;
    }

    private List<Listing> computeTrendingListings(int limit) {
        Map<Long, Long> viewScores = new HashMap<>();
        for (ListingViewAnalytics analytics : listingViewAnalyticsRepository.findAll()) {
            viewScores.put(analytics.getListing().getId(), analytics.getViewCount());
        }

        Map<Long, Long> interestScores = new HashMap<>();
        for (ListingInterestAnalytics analytics : listingInterestAnalyticsRepository.findAll()) {
            interestScores.put(analytics.getListing().getId(), analytics.getInterestCount());
        }

        return listingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(listing -> TRENDING_STATUSES.contains(listing.getStatus()))
                .sorted(Comparator.comparingLong((Listing listing) -> computeScore(listing, viewScores, interestScores))
                        .reversed()
                        .thenComparing(Listing::getCreatedAt, Comparator.reverseOrder()))
                .limit(limit)
                .toList();
    }

    private long computeScore(
            Listing listing,
            Map<Long, Long> viewScores,
            Map<Long, Long> interestScores
    ) {
        long listingId = listing.getId();
        long views = viewScores.getOrDefault(listingId, 0L);
        long interests = interestScores.getOrDefault(listingId, 0L);
        return views + (interests * 3L);
    }
}
