package com.campushub.service;

import com.campushub.dto.request.MessageRequest;
import com.campushub.dto.response.MessageResponse;
import com.campushub.entity.Listing;
import com.campushub.entity.Message;
import com.campushub.entity.User;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.ListingRepository;
import com.campushub.repository.MessageRepository;
import com.campushub.repository.UserRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public MessageResponse sendMessage(MessageRequest request) {
        User sender = userService.getCurrentAuthenticatedUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found with id: " + request.getReceiverId()));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent().trim())
                .listingId(request.getListingId())
                .build();

        Message savedMessage = messageRepository.save(message);
        notificationService.createNotification(receiver, buildMessageNotification(sender, request.getListingId()));

        return toMessageResponse(savedMessage);
    }

    public List<MessageResponse> getConversation(Long userId) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        return messageRepository.findConversation(currentUser.getId(), userId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    public List<MessageResponse> getInbox() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<Message> messages = messageRepository.findInboxMessages(currentUser.getId());
        Map<Long, Message> latestByOtherUser = new LinkedHashMap<>();

        for (Message message : messages) {
            Long otherUserId = message.getSender().getId().equals(currentUser.getId())
                    ? message.getReceiver().getId()
                    : message.getSender().getId();
            latestByOtherUser.putIfAbsent(otherUserId, message);
        }

        return new ArrayList<>(latestByOtherUser.values())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    public List<MessageResponse> getReceivedMessages() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return messageRepository.findByReceiverIdOrderByTimestampDesc(currentUser.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    private String buildMessageNotification(User sender, Long listingId) {
        String senderName = StringUtils.hasText(sender.getName()) ? sender.getName() : sender.getEmail();

        if (listingId == null) {
            return senderName + " sent you a message";
        }

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        return senderName + " sent you a message about " + listing.getTitle();
    }

    private MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .sender(userService.toUserResponse(message.getSender()))
                .receiver(userService.toUserResponse(message.getReceiver()))
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .listingId(message.getListingId())
                .build();
    }
}
