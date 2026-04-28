package com.campushub.events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EventCreatedEvent {

    private final Long eventId;
    private final String eventTitle;
}