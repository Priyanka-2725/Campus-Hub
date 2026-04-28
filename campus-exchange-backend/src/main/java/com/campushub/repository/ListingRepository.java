package com.campushub.repository;

import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.entity.enumtype.ListingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findAllByOrderByCreatedAtDesc();

    List<Listing> findByOwnerOrderByCreatedAtDesc(User owner);

    List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);

    List<Listing> findByStatusInOrderByCreatedAtDesc(Collection<ListingStatus> statuses);

    List<Listing> findByCategoryInAndStatusAndOwnerIdNotOrderByCreatedAtDesc(
            Collection<String> categories,
            ListingStatus status,
            Long ownerId
    );

    long countByStatus(ListingStatus status);

        @Modifying
        @Query("""
            update Listing l
            set l.status = :expiredStatus
            where l.status in :activeStatuses
              and l.createdAt < :cutoff
            """)
        int expireOldListings(
            @Param("cutoff") LocalDateTime cutoff,
            @Param("expiredStatus") ListingStatus expiredStatus,
            @Param("activeStatuses") Collection<ListingStatus> activeStatuses
        );
}
