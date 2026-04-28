package com.campushub.service;

import com.campushub.dto.response.ActivityResponse;
import com.campushub.entity.Activity;
import com.campushub.repository.ActivityRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public Activity createActivity(String type, String message) {
        Activity activity = Activity.builder()
                .type(type)
                .message(message)
                .build();
        return activityRepository.save(activity);
    }

    public List<ActivityResponse> getRecentActivities() {
        return activityRepository.findTop10ByOrderByTimestampDesc()
                .stream()
                .map(this::toActivityResponse)
                .toList();
    }

    private ActivityResponse toActivityResponse(Activity activity) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .type(activity.getType())
                .message(activity.getMessage())
                .timestamp(activity.getTimestamp())
                .build();
    }
}