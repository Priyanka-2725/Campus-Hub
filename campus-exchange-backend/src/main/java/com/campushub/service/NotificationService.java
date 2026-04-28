package com.campushub.service;

import com.campushub.dto.response.NotificationResponse;
import com.campushub.entity.Notification;
import com.campushub.entity.User;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.exception.UnauthorizedActionException;
import com.campushub.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public Notification createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    public List<NotificationResponse> getCurrentUserNotifications() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return notificationRepository.findByUserIdOrderByTimestampDesc(currentUser.getId())
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("You cannot modify another user's notification");
        }

        notification.setIsRead(true);
        return toNotificationResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .timestamp(notification.getTimestamp())
                .build();
    }
}
