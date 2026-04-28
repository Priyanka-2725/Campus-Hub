package com.campushub.repository;

import com.campushub.entity.UserPreference;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    Optional<UserPreference> findByUserIdAndCategory(Long userId, String category);

    List<UserPreference> findTop3ByUserIdOrderByViewCountDesc(Long userId);
}
