package com.agileflow.entity;

import com.agileflow.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
        uniqueConstraints = @UniqueConstraint(name = "uk_notification_dedupe", columnNames = "dedupe_key"),
        indexes = {@Index(name = "idx_notif_user", columnList = "user_id"), @Index(name = "idx_notif_status", columnList = "status")})
@Getter @Setter @NoArgsConstructor
public class Notification extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "task_id")
    private Task task;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private NotificationType type;
    @Column(nullable = false, length = 500) private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private NotificationStatus status = NotificationStatus.PENDING;
    @Column(name = "retry_count", nullable = false) private int retryCount = 0;
    @Column(name = "is_read", nullable = false) private boolean read = false;
    @Column(name = "dedupe_key", nullable = false, length = 200) private String dedupeKey;
    @Column(name = "last_error", length = 500) private String lastError;
    @Column(name = "next_attempt_at") private LocalDateTime nextAttemptAt;
    @Column(name = "sent_at") private LocalDateTime sentAt;
}
