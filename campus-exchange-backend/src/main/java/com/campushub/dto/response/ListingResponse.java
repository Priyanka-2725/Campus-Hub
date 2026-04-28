package com.campushub.dto.response;

import com.campushub.entity.enumtype.ListingStatus;
import java.time.LocalDateTime;
import java.util.List;
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
public class ListingResponse {

    private Long id;
    private String title;
    private String description;
    private Double price;
    private String category;
    private String imageUrl;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private UserResponse owner;
    private String reason;
    private List<String> badges;
    private Long interestCount;
    private Long viewCount;
    private Integer daysRemaining;
    private String urgencyText;
}
