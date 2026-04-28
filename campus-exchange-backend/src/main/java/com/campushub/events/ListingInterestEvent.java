package com.campushub.events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ListingInterestEvent {

    private final Long listingId;
    private final Long interestedUserId;
}
