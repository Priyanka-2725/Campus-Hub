package com.campushub.service;

import com.campushub.dto.request.CollaborationPostRequest;
import com.campushub.dto.response.CollaborationPostResponse;
import com.campushub.entity.CollaborationPost;
import com.campushub.entity.User;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.exception.UnauthorizedActionException;
import com.campushub.repository.CollabPostRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CollabPostService {

    private final CollabPostRepository collabPostRepository;
    private final UserService userService;

    public List<CollaborationPostResponse> getAllPosts() {
        return collabPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CollaborationPostResponse createPost(CollaborationPostRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        CollaborationPost post = CollaborationPost.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .createdBy(currentUser)
                .build();

        return toResponse(collabPostRepository.save(post));
    }

    public List<CollaborationPostResponse> getCurrentUserPosts() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return collabPostRepository.findByCreatedByOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void deletePost(Long postId) {
        CollaborationPost post = collabPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Collaboration post not found with id: " + postId));
        User currentUser = userService.getCurrentAuthenticatedUser();

        if (!post.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("Only the owner can delete this collaboration post");
        }

        collabPostRepository.delete(post);
    }

    private CollaborationPostResponse toResponse(CollaborationPost post) {
        return CollaborationPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .type(post.getType())
                .createdBy(userService.toUserResponse(post.getCreatedBy()))
                .createdAt(post.getCreatedAt())
                .build();
    }
}
