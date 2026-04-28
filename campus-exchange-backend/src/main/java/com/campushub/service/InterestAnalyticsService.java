package com.campushub.service;

import com.campushub.entity.Listing;
import com.campushub.entity.ListingInterestAnalytics;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.ListingInterestAnalyticsRepository;
import com.campushub.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InterestAnalyticsService {

    private final ListingInterestAnalyticsRepository listingInterestAnalyticsRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public long incrementInterestCount(Long listingId) {
        ListingInterestAnalytics analytics = listingInterestAnalyticsRepository.findByListingId(listingId)
                .orElseGet(() -> createAnalyticsRecord(listingId));

        analytics.setInterestCount(analytics.getInterestCount() + 1);
        return listingInterestAnalyticsRepository.save(analytics).getInterestCount();
    }

    @Transactional(readOnly = true)
    public long getInterestCount(Long listingId) {
        return listingInterestAnalyticsRepository.findByListingId(listingId)
                .map(ListingInterestAnalytics::getInterestCount)
                .orElse(0L);
    }

    private ListingInterestAnalytics createAnalyticsRecord(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        return ListingInterestAnalytics.builder()
                .listing(listing)
                .interestCount(0L)
                .build();
    }
}
