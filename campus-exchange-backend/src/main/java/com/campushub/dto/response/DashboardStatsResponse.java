package com.campushub.dto.response;

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
public class DashboardStatsResponse {

    private Long totalUsers;
    private Long activeListings;
    private Long soldListings;
    private Long totalEvents;
    private Long unreadNotifications;
    private Long totalCollaborations;
    private String insightHeadline;
    private String insightDetail;
    private String bestTimeToPost;
    private String topCategory;
}
