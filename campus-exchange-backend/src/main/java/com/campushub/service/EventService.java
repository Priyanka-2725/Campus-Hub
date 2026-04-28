package com.campushub.service;

import com.campushub.dto.request.EventRequest;
import com.campushub.dto.response.EventResponse;
import com.campushub.dto.response.UserResponse;
import com.campushub.entity.Event;
import com.campushub.entity.User;
import com.campushub.events.EventCreatedEvent;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.EventRepository;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public java.util.List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByDateTimeAsc()
                .stream()
                .map(this::toEventResponseForAnonymous)
                .toList();
    }

    public EventResponse getEventById(Long eventId) {
        Event event = getEventEntityById(eventId);
        User currentUser = getAuthenticatedUserIfPresent();
        return toEventResponse(event, currentUser);
    }

    public EventResponse createEvent(EventRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .dateTime(request.getDateTime())
                .createdBy(currentUser)
                .build();

        event.getParticipants().add(currentUser);
        Event savedEvent = eventRepository.save(event);
        applicationEventPublisher.publishEvent(new EventCreatedEvent(savedEvent.getId(), savedEvent.getTitle()));
        return toEventResponse(savedEvent, currentUser);
    }

    public java.util.List<EventResponse> getCurrentUserEvents() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return eventRepository.findByCreatedByOrderByDateTimeDesc(currentUser)
                .stream()
                .map(event -> toEventResponse(event, currentUser))
                .toList();
    }

    public EventResponse joinEvent(Long eventId) {
        Event event = getEventEntityById(eventId);
        User currentUser = userService.getCurrentAuthenticatedUser();

        boolean added = event.getParticipants().add(currentUser);
        Event savedEvent = eventRepository.save(event);

        if (added && !event.getCreatedBy().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    event.getCreatedBy(),
                    currentUser.getName() + " joined your event: " + event.getTitle()
            );
        }

        return toEventResponse(savedEvent, currentUser);
    }

    private Event getEventEntityById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
    }

    private EventResponse toEventResponseForAnonymous(Event event) {
        return toEventResponse(event, null);
    }

    private EventResponse toEventResponse(Event event, User currentUser) {
        Set<UserResponse> participantResponses = event.getParticipants()
                .stream()
                .map(userService::toUserResponse)
                .collect(Collectors.toSet());

        boolean joined = currentUser != null
                && event.getParticipants().stream().anyMatch(user -> user.getId().equals(currentUser.getId()));

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .dateTime(event.getDateTime())
                .createdBy(userService.toUserResponse(event.getCreatedBy()))
                .participants(participantResponses)
                .participantCount(participantResponses.size())
                .joined(joined)
                .build();
    }

    private User getAuthenticatedUserIfPresent() {
        try {
            return userService.getCurrentAuthenticatedUser();
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
