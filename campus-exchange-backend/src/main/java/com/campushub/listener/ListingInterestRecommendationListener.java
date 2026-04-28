package com.campushub.listener;

import com.campushub.events.ListingInterestEvent;
import com.campushub.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingInterestRecommendationListener {

    private final RecommendationService recommendationService;

    @Async
    @EventListener
    public void handleListingInterest(ListingInterestEvent event) {
        recommendationService.onListingInterest(event.getListingId(), event.getInterestedUserId());
    }
}
