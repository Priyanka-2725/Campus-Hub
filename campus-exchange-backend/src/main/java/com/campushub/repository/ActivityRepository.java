package com.campushub.repository;

import com.campushub.entity.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findTop10ByOrderByTimestampDesc();
}