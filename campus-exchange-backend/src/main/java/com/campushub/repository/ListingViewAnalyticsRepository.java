package com.campushub.repository;

import com.campushub.entity.ListingViewAnalytics;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingViewAnalyticsRepository extends JpaRepository<ListingViewAnalytics, Long> {

    Optional<ListingViewAnalytics> findByListingId(Long listingId);
}
