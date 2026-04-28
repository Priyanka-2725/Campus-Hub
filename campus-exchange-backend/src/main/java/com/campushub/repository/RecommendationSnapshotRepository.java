package com.campushub.repository;

import com.campushub.entity.RecommendationSnapshot;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationSnapshotRepository extends JpaRepository<RecommendationSnapshot, Long> {

    List<RecommendationSnapshot> findByUserIdAndSnapshotDateOrderByRankPositionAsc(Long userId, LocalDate snapshotDate);

    void deleteByUserIdAndSnapshotDate(Long userId, LocalDate snapshotDate);
}
