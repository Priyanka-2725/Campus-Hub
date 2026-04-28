package com.campushub.repository;

import com.campushub.entity.ListingInterestAnalytics;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingInterestAnalyticsRepository extends JpaRepository<ListingInterestAnalytics, Long> {

    Optional<ListingInterestAnalytics> findByListingId(Long listingId);
}
