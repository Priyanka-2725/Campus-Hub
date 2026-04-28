package com.campushub.controller;

import com.campushub.config.DataSeeder;
import com.campushub.repository.CollabPostRepository;
import com.campushub.repository.EventRepository;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.MessageRepository;
import com.campushub.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevSeederController {

    private final DataSeeder dataSeeder;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final EventRepository eventRepository;
    private final CollabPostRepository collabPostRepository;
    private final MessageRepository messageRepository;

    @GetMapping("/seed")
    public ResponseEntity<Map<String, Long>> seedNowViaGet() {
        return runSeed();
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, Long>> seedNow() {
        return runSeed();
    }

    private ResponseEntity<Map<String, Long>> runSeed() {
        dataSeeder.seedIfNeeded();

        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("users", userRepository.count());
        counts.put("listings", listingRepository.count());
        counts.put("events", eventRepository.count());
        counts.put("posts", collabPostRepository.count());
        counts.put("messages", messageRepository.count());

        return ResponseEntity.ok(counts);
    }
}