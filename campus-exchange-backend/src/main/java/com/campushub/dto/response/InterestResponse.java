package com.campushub.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestResponse {

    private Long id;
    private Long listingId;
    private String listingTitle;
    private UserResponse interestedUser;
    private LocalDateTime timestamp;
}
