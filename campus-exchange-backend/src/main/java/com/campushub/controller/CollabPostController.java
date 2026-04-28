package com.campushub.controller;

import com.campushub.dto.request.CollaborationPostRequest;
import com.campushub.dto.response.CollaborationPostResponse;
import com.campushub.service.CollabPostService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/collab")
@RequiredArgsConstructor
public class CollabPostController {

    private final CollabPostService collabPostService;

    @GetMapping
    public ResponseEntity<List<CollaborationPostResponse>> getAllPosts() {
        return ResponseEntity.ok(collabPostService.getAllPosts());
    }

    @PostMapping
    public ResponseEntity<CollaborationPostResponse> createPost(
            @Valid @RequestBody CollaborationPostRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collabPostService.createPost(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        collabPostService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
