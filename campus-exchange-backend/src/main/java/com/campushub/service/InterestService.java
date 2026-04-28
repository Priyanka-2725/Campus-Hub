package com.campushub.service;

import com.campushub.dto.response.InterestResponse;
import com.campushub.entity.Interest;
import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.repository.InterestRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterestService {

    private final InterestRepository interestRepository;
    private final UserService userService;

    public void recordInterest(Listing listing, User interestedUser) {
        interestRepository.findByListingIdAndUserId(listing.getId(), interestedUser.getId())
                .orElseGet(() -> interestRepository.save(
                        Interest.builder()
                                .listing(listing)
                                .user(interestedUser)
                                .build()
                ));
    }

    public List<InterestResponse> getCurrentUserListingInterests() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return interestRepository.findByListingOwnerIdOrderByTimestampDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private InterestResponse toResponse(Interest interest) {
        return InterestResponse.builder()
                .id(interest.getId())
                .listingId(interest.getListing().getId())
                .listingTitle(interest.getListing().getTitle())
                .interestedUser(userService.toUserResponse(interest.getUser()))
                .timestamp(interest.getTimestamp())
                .build();
    }
}
