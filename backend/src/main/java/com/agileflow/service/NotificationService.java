package com.agileflow.service;

import com.agileflow.dto.Dtos.*;
import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notifications;

    /** Users only see notifications that the background workflow has delivered (status SENT). */
    @Transactional
    public List<NotificationResponse> list(Long uid) {
        return notifications.findByUserIdAndStatusOrderByCreatedAtDesc(uid, NotificationStatus.SENT).stream().map(this::toDto).toList();
    }

    @Transactional
    public long unreadCount(Long uid) { return notifications.countByUserIdAndStatusAndReadFalse(uid, NotificationStatus.SENT); }

    @Transactional
    public NotificationResponse markRead(Long id, Long uid) {
        Notification n = notifications.findByIdAndUserId(id, uid).orElseThrow(() -> ApiException.notFound("Notification not found"));
        n.setRead(true);
        return toDto(notifications.save(n));
    }

    @Transactional
    public void markAllRead(Long uid) {
        for (Notification n : notifications.findByUserIdAndStatusOrderByCreatedAtDesc(uid, NotificationStatus.SENT)) {
            if (!n.isRead()) { n.setRead(true); notifications.save(n); }
        }
    }

    private NotificationResponse toDto(Notification n) {
        Long taskId = null, projectId = null;
        if (n.getTask() != null) { taskId = n.getTask().getId(); projectId = n.getTask().getStory().getProject().getId(); }
        return new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.getStatus(), n.getRetryCount(), n.isRead(), taskId, projectId, n.getCreatedAt());
    }
}
