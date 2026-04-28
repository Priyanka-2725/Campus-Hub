package com.campushub.service;

import com.campushub.entity.Listing;
import com.campushub.entity.ListingViewAnalytics;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.ListingViewAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListingViewAnalyticsService {

    private final ListingViewAnalyticsRepository listingViewAnalyticsRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public long incrementViewCount(Long listingId) {
        ListingViewAnalytics analytics = listingViewAnalyticsRepository.findByListingId(listingId)
                .orElseGet(() -> createAnalyticsRecord(listingId));

        analytics.setViewCount(analytics.getViewCount() + 1);
        return listingViewAnalyticsRepository.save(analytics).getViewCount();
    }

    @Transactional(readOnly = true)
    public long getViewCount(Long listingId) {
        return listingViewAnalyticsRepository.findByListingId(listingId)
                .map(ListingViewAnalytics::getViewCount)
                .orElse(0L);
    }

    public long getViewCount(Listing listing) {
        return getViewCount(listing.getId());
    }

    private ListingViewAnalytics createAnalyticsRecord(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        return ListingViewAnalytics.builder()
                .listing(listing)
                .viewCount(0L)
                .build();
    }
}
