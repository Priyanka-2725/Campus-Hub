package com.campushub.controller;

import com.campushub.dto.response.ActivityResponse;
import com.campushub.service.ActivityService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities() {
        return ResponseEntity.ok(activityService.getRecentActivities());
    }
}