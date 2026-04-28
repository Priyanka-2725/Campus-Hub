package com.campushub.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private Long id;
    private UserResponse sender;
    private UserResponse receiver;
    private String content;
    private LocalDateTime timestamp;
    private Long listingId;
}
