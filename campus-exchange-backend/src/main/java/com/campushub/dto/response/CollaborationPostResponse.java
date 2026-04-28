package com.campushub.dto.response;

import com.campushub.entity.enumtype.CollaborationType;
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
public class CollaborationPostResponse {

    private Long id;
    private String title;
    private String description;
    private CollaborationType type;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
}
