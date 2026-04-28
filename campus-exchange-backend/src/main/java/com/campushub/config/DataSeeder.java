package com.campushub.config;

import com.campushub.entity.CollaborationPost;
import com.campushub.entity.Event;
import com.campushub.entity.Listing;
import com.campushub.entity.Message;
import com.campushub.entity.User;
import com.campushub.entity.enumtype.CollaborationType;
import com.campushub.entity.enumtype.ListingStatus;
import com.campushub.entity.enumtype.UserRole;
import com.campushub.repository.CollabPostRepository;
import com.campushub.repository.EventRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.MessageRepository;
import com.campushub.repository.UserRepository;
import com.campushub.util.AvatarUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final Random RANDOM = new Random();
    private static final String[] CATEGORIES = {"Electronics", "Books", "Furniture", "Notes"};
    private static final String[] LISTING_TITLES = {
            "Laptop", "Textbook", "Desk Chair", "Lecture Notes", "Headphones",
            "Monitor", "Calculator", "Microwave", "Backpack", "Tablet"
    };
    private static final String[] EVENT_TOPICS = {
            "Career Night", "Hackathon Warmup", "Study Sprint", "Club Meetup", "Campus Mixer"
    };
    private static final String[] POST_TOPICS = {
            "Need teammate", "Looking for help", "Project partner wanted", "Group study open", "Hackathon squad"
    };
    private static final String[] MESSAGE_TEMPLATES = {
            "Hello! Is this item still available?",
            "Could you share a little more detail?",
            "Would you consider a lower price?",
            "Can I pick this up later today?",
            "I'm interested. When can we meet?"
    };

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final EventRepository eventRepository;
    private final CollabPostRepository collabPostRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedIfNeeded();
    }

    @Transactional
    public synchronized void seedIfNeeded() {
        long userCount = userRepository.count();
        long listingCount = listingRepository.count();
        long eventCount = eventRepository.count();
        long postCount = collabPostRepository.count();
        long messageCount = messageRepository.count();

        log.info(
                "DataSeeder startup counts - users: {}, listings: {}, events: {}, posts: {}, messages: {}",
                userCount,
                listingCount,
                eventCount,
                postCount,
                messageCount
        );

        List<User> users;
        if (userCount == 0) {
            users = seedUsers();
            log.info("Seeded {} users", users.size());
        } else {
            users = userRepository.findAll();
        }

        if (listingCount == 0) {
            seedListings(users);
            log.info("Seeded listings");
        }

        if (eventCount == 0) {
            seedEvents(users);
            log.info("Seeded events");
        }

        if (postCount == 0) {
            seedPosts(users);
            log.info("Seeded collaboration posts");
        }

        if (messageCount == 0 && !users.isEmpty() && listingRepository.count() > 0) {
            seedMessages(users);
            log.info("Seeded messages");
        }

        log.info("DataSeeder completed");
    }

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();

        for (int i = 1; i <= 10; i++) {
            User user = User.builder()
                    .name("User " + i)
                    .email("user" + i + "@test.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRole.STUDENT)
                    .profileImageUrl(AvatarUtil.generateAvatarUrl("User " + i))
                    .build();
            users.add(userRepository.save(user));
        }

        return users;
    }

    private void seedListings(List<User> users) {
        List<Listing> listings = new ArrayList<>();

        for (int userIndex = 0; userIndex < users.size(); userIndex++) {
            User owner = users.get(userIndex);

            for (int listingIndex = 1; listingIndex <= 10; listingIndex++) {
                int categoryIndex = (userIndex + listingIndex) % CATEGORIES.length;
                int titleIndex = (listingIndex - 1) % LISTING_TITLES.length;
                ListingStatus status = resolveListingStatus(listingIndex);

                Listing listing = Listing.builder()
                        .title(LISTING_TITLES[titleIndex] + " " + listingIndex + " by " + owner.getName())
                        .description("Well maintained student item in good condition. Perfect for campus use.")
                        .price((double) (500 + RANDOM.nextInt(4501)))
                        .category(CATEGORIES[categoryIndex])
                        .imageUrl(generateListingImageUrl(owner.getName(), listingIndex))
                        .status(status)
                        .owner(owner)
                        .createdAt(LocalDateTime.now().minusDays(RANDOM.nextInt(10)).minusHours(RANDOM.nextInt(12)))
                        .build();
                listings.add(listing);
            }
        }

        listingRepository.saveAll(listings);
    }

    private void seedEvents(List<User> users) {
        List<Event> events = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            User creator = users.get(i % users.size());
            Event event = Event.builder()
                    .title(EVENT_TOPICS[i - 1] + " " + i)
                    .description("Join this campus event for students, friends, and new opportunities.")
                    .location("Auditorium " + i)
                    .dateTime(LocalDateTime.now().plusDays(i).withHour(17).withMinute(30).withSecond(0).withNano(0))
                    .createdBy(creator)
                    .build();
            event.getParticipants().add(creator);
            events.add(event);
        }

        eventRepository.saveAll(events);
    }

    private void seedPosts(List<User> users) {
        List<CollaborationPost> posts = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            User creator = users.get((i + 2) % users.size());
            CollaborationPost post = CollaborationPost.builder()
                    .title(POST_TOPICS[(i - 1) % POST_TOPICS.length] + " " + i)
                    .description("Need help with project " + i + ", ideally from someone comfortable with teamwork.")
                    .type(i % 2 == 0 ? CollaborationType.TEAM : CollaborationType.HELP)
                    .createdBy(creator)
                    .createdAt(LocalDateTime.now().minusDays(i).minusHours(RANDOM.nextInt(8)))
                    .build();
            posts.add(post);
        }

        collabPostRepository.saveAll(posts);
    }

    private void seedMessages(List<User> users) {
        List<Listing> listings = listingRepository.findAll();

        for (int i = 0; i < 20; i++) {
            User sender = users.get(RANDOM.nextInt(users.size()));
            User receiver = pickDifferentUser(users, sender);
            Listing listing = listings.get(RANDOM.nextInt(listings.size()));

            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .content(MESSAGE_TEMPLATES[i % MESSAGE_TEMPLATES.length])
                    .listingId(RANDOM.nextBoolean() ? listing.getId() : null)
                    .timestamp(LocalDateTime.now().minusHours(RANDOM.nextInt(72)).minusMinutes(RANDOM.nextInt(60)))
                    .build();
            messageRepository.save(message);
        }
    }

    private User pickDifferentUser(List<User> users, User reference) {
        User candidate = reference;
        while (candidate.getId().equals(reference.getId())) {
            candidate = users.get(RANDOM.nextInt(users.size()));
        }
        return candidate;
    }

    private ListingStatus resolveListingStatus(int listingIndex) {
        if (listingIndex % 10 == 0) {
            return ListingStatus.SOLD;
        }

        if (listingIndex % 5 == 0) {
            return ListingStatus.INTERESTED;
        }

        return ListingStatus.AVAILABLE;
    }

    private String generateListingImageUrl(String ownerName, int listingIndex) {
        return AvatarUtil.generateAvatarUrl(ownerName + " listing " + listingIndex);
    }
}