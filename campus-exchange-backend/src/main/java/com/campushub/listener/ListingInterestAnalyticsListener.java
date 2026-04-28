package com.campushub.listener;

import com.campushub.events.ListingInterestEvent;
import com.campushub.service.InterestAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ListingInterestAnalyticsListener {

    private final InterestAnalyticsService interestAnalyticsService;

    @Async
    @EventListener
    public void handleListingInterest(ListingInterestEvent event) {
        long updatedCount = interestAnalyticsService.incrementInterestCount(event.getListingId());
        log.info("Listing {} interest count incremented to {}", event.getListingId(), updatedCount);
    }
}
