package com.campushub.repository;

import com.campushub.entity.Interest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    Optional<Interest> findByListingIdAndUserId(Long listingId, Long userId);

    List<Interest> findByListingOwnerIdOrderByTimestampDesc(Long ownerId);
}
