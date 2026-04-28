package com.campushub.service;

import com.campushub.dto.request.ListingRequest;
import com.campushub.dto.response.ListingResponse;
import com.campushub.dto.response.PriceSuggestionResponse;
import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.events.ListingInterestEvent;
import com.campushub.events.ListingViewedEvent;
import com.campushub.exception.InvalidStateTransitionException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.exception.UnauthorizedActionException;
import com.campushub.repository.ListingRepository;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserService userService;
    private final RecommendationService recommendationService;
    private final InterestService interestService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final AIService aiService;
    private final ListingViewAnalyticsService listingViewAnalyticsService;
    private final InterestAnalyticsService interestAnalyticsService;
    private final TrendingListingService trendingListingService;

    public List<ListingResponse> getAllListings() {
        return listingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(listing -> toListingResponse(listing, null))
                .toList();
    }

    public ListingResponse getListingById(Long listingId) {
        Listing listing = getListingEntityById(listingId);
        long viewCount = listingViewAnalyticsService.incrementViewCount(listingId);
        User currentUser = getAuthenticatedUserIfPresent();

        if (currentUser != null && !listing.getOwner().getId().equals(currentUser.getId())) {
            recommendationService.trackListingView(currentUser, listing);
        }

        applicationEventPublisher.publishEvent(new ListingViewedEvent(listing.getId(), viewCount));
        return toListingResponse(listing, null);
    }

    public ListingResponse createListing(ListingRequest request) {
        if (aiService.isSpam(request.getDescription())) {
            throw new RuntimeException("Spam detected");
        }

        User currentUser = userService.getCurrentAuthenticatedUser();

        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .status(ListingStatus.AVAILABLE)
                .owner(currentUser)
                .build();

        return toListingResponse(listingRepository.save(listing), null);
    }

    public ListingResponse updateListing(Long listingId, ListingRequest request) {
        Listing listing = getListingEntityById(listingId);
        User currentUser = userService.getCurrentAuthenticatedUser();
        validateOwner(listing, currentUser, "Only the owner can update this listing");

        if (aiService.isSpam(request.getDescription())) {
            throw new RuntimeException("Spam detected");
        }

        if (listing.getStatus() == ListingStatus.SOLD || listing.getStatus() == ListingStatus.EXPIRED) {
            throw new InvalidStateTransitionException("Cannot edit sold or expired listing");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setImageUrl(request.getImageUrl());

        return toListingResponse(listingRepository.save(listing), null);
    }

    public List<ListingResponse> getCurrentUserListings() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return listingRepository.findByOwnerOrderByCreatedAtDesc(currentUser)
            .stream()
            .map(listing -> toListingResponse(listing, null))
            .toList();
    }

    public void deleteListing(Long listingId) {
        Listing listing = getListingEntityById(listingId);
        User currentUser = userService.getCurrentAuthenticatedUser();
        validateOwner(listing, currentUser, "Only the owner can delete this listing");
        listingRepository.delete(listing);
    }

    public ListingResponse expressInterest(Long listingId) {
        Listing listing = getListingEntityById(listingId);
        User currentUser = userService.getCurrentAuthenticatedUser();

        if (listing.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("Owners cannot mark interest in their own listing");
        }

        if (listing.getStatus() == ListingStatus.SOLD) {
            throw new InvalidStateTransitionException("Listing is already sold");
        }

        if (listing.getStatus() == ListingStatus.INTERESTED) {
            throw new InvalidStateTransitionException("Listing is already marked as interested");
        }

        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new InvalidStateTransitionException("Invalid listing state transition");
        }

        listing.setStatus(ListingStatus.INTERESTED);
        Listing savedListing = listingRepository.save(listing);
        interestService.recordInterest(listing, currentUser);
        applicationEventPublisher.publishEvent(new ListingInterestEvent(savedListing.getId(), currentUser.getId()));
        return toListingResponse(savedListing, null);
    }

    public ListingResponse confirmSale(Long listingId) {
        Listing listing = getListingEntityById(listingId);
        User currentUser = userService.getCurrentAuthenticatedUser();
        validateOwner(listing, currentUser, "Only the owner can confirm a sale");

        if (listing.getStatus() == ListingStatus.SOLD) {
            throw new InvalidStateTransitionException("Listing is already sold");
        }

        if (listing.getStatus() != ListingStatus.INTERESTED) {
            throw new InvalidStateTransitionException("Listing must be marked as interested before confirming sale");
        }

        listing.setStatus(ListingStatus.SOLD);
        return toListingResponse(listingRepository.save(listing), null);
    }

    public List<ListingResponse> getTrendingListings() {
        return trendingListingService.getTrendingListings(10)
            .stream()
            .map(listing -> toListingResponse(listing, null))
            .toList();
    }

    public String generateDescription(String title) {
        return aiService.generateDescription(title);
    }

    public PriceSuggestionResponse suggestPrice(String title, String category) {
        return aiService.suggestPrice(title, category);
    }

    public List<ListingResponse> getRecommendedListings() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return recommendationService.getRecommendedListings(currentUser);
    }

    private Listing getListingEntityById(Long listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
    }

    private void validateOwner(Listing listing, User currentUser, String message) {
        if (!listing.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException(message);
        }
    }

    private User getAuthenticatedUserIfPresent() {
        try {
            return userService.getCurrentAuthenticatedUser();
        } catch (RuntimeException ex) {
            return null;
        }
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
        if (listing.getStatus() == ListingStatus.INTERESTED) {
            badges.add("Hot Listing");
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

        return listing.getCreatedAt() != null && ChronoUnit.HOURS.between(listing.getCreatedAt(), LocalDateTime.now()) < 24
                ? "Fresh listing"
                : null;
    }
}
