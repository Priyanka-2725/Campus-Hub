package com.campushub.listener;

import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.events.ListingInterestEvent;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingInterestNotificationListener {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleListingInterest(ListingInterestEvent event) {
        Listing listing = listingRepository.findById(event.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + event.getListingId()));

        User interestedUser = userRepository.findById(event.getInterestedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + event.getInterestedUserId()));

        notificationService.createNotification(
                listing.getOwner(),
                interestedUser.getName() + " is interested in your listing: " + listing.getTitle()
        );
    }
}
