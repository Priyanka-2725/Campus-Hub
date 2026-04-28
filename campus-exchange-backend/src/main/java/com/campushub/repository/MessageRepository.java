package com.campushub.repository;

import com.campushub.entity.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            SELECT m
            FROM Message m
            WHERE (m.sender.id = :currentUserId AND m.receiver.id = :otherUserId)
               OR (m.sender.id = :otherUserId AND m.receiver.id = :currentUserId)
            ORDER BY m.timestamp ASC
            """)
    List<Message> findConversation(
            @Param("currentUserId") Long currentUserId,
            @Param("otherUserId") Long otherUserId
    );

    @Query("""
            SELECT m
            FROM Message m
            WHERE m.sender.id = :userId OR m.receiver.id = :userId
            ORDER BY m.timestamp DESC
            """)
    List<Message> findInboxMessages(@Param("userId") Long userId);

        List<Message> findByReceiverIdOrderByTimestampDesc(Long receiverId);
}
