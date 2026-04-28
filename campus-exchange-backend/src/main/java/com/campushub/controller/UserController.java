package com.campushub.controller;

import com.campushub.dto.response.CollaborationPostResponse;
import com.campushub.dto.response.EventResponse;
import com.campushub.dto.response.InterestResponse;
import com.campushub.dto.response.ListingResponse;
import com.campushub.dto.response.MessageResponse;
import com.campushub.dto.response.UserResponse;
import com.campushub.service.CollabPostService;
import com.campushub.service.EventService;
import com.campushub.service.InterestService;
import com.campushub.service.ListingService;
import com.campushub.service.MessageService;
import com.campushub.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ListingService listingService;
    private final EventService eventService;
    private final CollabPostService collabPostService;
    private final MessageService messageService;
    private final InterestService interestService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @GetMapping("/me/listings")
    public ResponseEntity<List<ListingResponse>> getCurrentUserListings() {
        return ResponseEntity.ok(listingService.getCurrentUserListings());
    }

    @GetMapping("/me/events")
    public ResponseEntity<List<EventResponse>> getCurrentUserEvents() {
        return ResponseEntity.ok(eventService.getCurrentUserEvents());
    }

    @GetMapping("/me/posts")
    public ResponseEntity<List<CollaborationPostResponse>> getCurrentUserPosts() {
        return ResponseEntity.ok(collabPostService.getCurrentUserPosts());
    }

    @GetMapping("/me/responses")
    public ResponseEntity<List<MessageResponse>> getCurrentUserResponses() {
        return ResponseEntity.ok(messageService.getReceivedMessages());
    }

    @GetMapping("/me/interests")
    public ResponseEntity<List<InterestResponse>> getCurrentUserInterests() {
        return ResponseEntity.ok(interestService.getCurrentUserListingInterests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
