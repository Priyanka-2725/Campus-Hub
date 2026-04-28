package com.campushub.listener;

import com.campushub.entity.Event;
import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.events.EventCreatedEvent;
import com.campushub.events.ListingInterestEvent;
import com.campushub.events.ListingViewedEvent;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.EventRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActivityFeedListener {

    private final ActivityService activityService;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Async
    @EventListener
    public void handleListingViewed(ListingViewedEvent event) {
        Listing listing = listingRepository.findById(event.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + event.getListingId()));

        activityService.createActivity(
                "VIEW",
                event.getViewCount() + " people viewed " + listing.getTitle()
        );
    }

    @Async
    @EventListener
    public void handleListingInterest(ListingInterestEvent event) {
        Listing listing = listingRepository.findById(event.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + event.getListingId()));
        User interestedUser = userRepository.findById(event.getInterestedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + event.getInterestedUserId()));

        activityService.createActivity(
                "INTEREST",
                interestedUser.getName() + " just showed interest in " + listing.getTitle()
        );
    }

    @Async
    @EventListener
    public void handleEventCreated(EventCreatedEvent event) {
        Event createdEvent = eventRepository.findById(event.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + event.getEventId()));

        activityService.createActivity(
                "EVENT",
                "New event added: " + createdEvent.getTitle()
        );
    }
}