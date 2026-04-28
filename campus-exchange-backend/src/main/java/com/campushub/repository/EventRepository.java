package com.campushub.repository;

import com.campushub.entity.Event;
import com.campushub.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByDateTimeAsc();

    List<Event> findByCreatedByOrderByDateTimeDesc(User createdBy);

    List<Event> findByDateTimeBetweenOrderByDateTimeAsc(LocalDateTime start, LocalDateTime end);

    long count();
}
