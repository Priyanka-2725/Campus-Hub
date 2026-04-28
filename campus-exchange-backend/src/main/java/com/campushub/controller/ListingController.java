package com.campushub.controller;

import com.campushub.dto.request.DescriptionGenerationRequest;
import com.campushub.dto.request.ListingRequest;
import com.campushub.dto.request.PriceSuggestionRequest;
import com.campushub.dto.response.DescriptionGenerationResponse;
import com.campushub.dto.response.ListingResponse;
import com.campushub.dto.response.PriceSuggestionResponse;
import com.campushub.service.ListingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody ListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.createListing(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingRequest request
    ) {
        return ResponseEntity.ok(listingService.updateListing(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        listingService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/interest")
    public ResponseEntity<ListingResponse> expressInterest(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.expressInterest(id));
    }

    @PostMapping("/{id}/confirm-sale")
    public ResponseEntity<ListingResponse> confirmSale(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.confirmSale(id));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<ListingResponse>> getRecommendedListings() {
        return ResponseEntity.ok(listingService.getRecommendedListings());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ListingResponse>> getTrendingListings() {
        return ResponseEntity.ok(listingService.getTrendingListings());
    }

    @PostMapping("/ai/description")
    public ResponseEntity<DescriptionGenerationResponse> generateDescription(
            @Valid @RequestBody DescriptionGenerationRequest request
    ) {
        String generatedDescription = listingService.generateDescription(request.getTitle());
        return ResponseEntity.ok(
                DescriptionGenerationResponse.builder()
                        .title(request.getTitle())
                        .generatedDescription(generatedDescription)
                        .build()
        );
    }

    @PostMapping("/ai/price-suggestion")
    public ResponseEntity<PriceSuggestionResponse> suggestPrice(
            @Valid @RequestBody PriceSuggestionRequest request
    ) {
        return ResponseEntity.ok(listingService.suggestPrice(request.getTitle(), request.getCategory()));
    }
}
