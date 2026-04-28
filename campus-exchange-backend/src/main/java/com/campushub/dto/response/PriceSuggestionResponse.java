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
public class PriceSuggestionResponse {

    private String title;
    private String category;
    private Double minSuggestedPrice;
    private Double maxSuggestedPrice;
}
