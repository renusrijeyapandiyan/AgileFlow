package com.agileflow.controller;

import com.agileflow.dto.Dtos.*;
import com.agileflow.security.AuthUser;
import com.agileflow.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notifications;

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal AuthUser u) { return notifications.list(u.id()); }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(@AuthenticationPrincipal AuthUser u) { return Map.of("count", notifications.unreadCount(u.id())); }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal AuthUser u) {
        notifications.markAllRead(u.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse read(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) { return notifications.markRead(id, u.id()); }
}
