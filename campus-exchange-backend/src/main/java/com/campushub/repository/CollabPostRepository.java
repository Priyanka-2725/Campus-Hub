package com.campushub.repository;

import com.campushub.entity.CollaborationPost;
import com.campushub.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollabPostRepository extends JpaRepository<CollaborationPost, Long> {

    List<CollaborationPost> findAllByOrderByCreatedAtDesc();

    List<CollaborationPost> findByCreatedByOrderByCreatedAtDesc(User createdBy);
}
