package com.campushub.integration;

import com.campushub.entity.Listing;
import com.campushub.entity.User;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.repository.InterestRepository;
import com.campushub.repository.ListingInterestAnalyticsRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.MessageRepository;
import com.campushub.repository.NotificationRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.ListingService;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Tag("Layer1")
class ListingInterestEventFlowL1Test {

    @Autowired
    private ListingService listingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ListingInterestAnalyticsRepository listingInterestAnalyticsRepository;

    @Autowired
    private MessageRepository messageRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        interestRepository.deleteAll();
        listingInterestAnalyticsRepository.deleteAll();
        messageRepository.deleteAll();
        listingRepository.deleteAll();
        userRepository.deleteAll();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void expressInterestPublishesEventAndTriggersAsyncSideEffects() throws Exception {
        User seller = userRepository.save(User.builder()
                .name("Seller")
                .email("seller@campus.test")
                .password("pass")
                .build());

        User buyer = userRepository.save(User.builder()
                .name("Buyer")
                .email("buyer@campus.test")
                .password("pass")
                .build());

        Listing listing = listingRepository.save(Listing.builder()
                .title("Bike")
                .description("Hybrid bike")
                .price(120.0)
                .category("Sports")
                .status(ListingStatus.AVAILABLE)
                .owner(seller)
                .build());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(buyer.getEmail(), null, Collections.emptyList())
        );

        listingService.expressInterest(listing.getId());

        Instant timeout = Instant.now().plus(Duration.ofSeconds(5));
        boolean sideEffectsCompleted = false;

        while (Instant.now().isBefore(timeout)) {
            long notificationCount = notificationRepository.findByUserIdOrderByTimestampDesc(seller.getId()).size();
            long analyticsCount = listingInterestAnalyticsRepository.findByListingId(listing.getId())
                    .map(analytics -> analytics.getInterestCount())
                    .orElse(0L);

            if (notificationCount == 1 && analyticsCount == 1L) {
                sideEffectsCompleted = true;
                break;
            }

            Thread.sleep(100);
        }

        Assertions.assertTrue(sideEffectsCompleted, "Async listener side effects were not completed in time");

        Assertions.assertTrue(
                interestRepository.findByListingIdAndUserId(listing.getId(), buyer.getId()).isPresent(),
                "Interest record should be saved"
        );

        Assertions.assertEquals(
                ListingStatus.INTERESTED,
                listingRepository.findById(listing.getId()).orElseThrow().getStatus(),
                "Listing should move to INTERESTED state"
        );
    }
}
