package com.agileflow.scheduler;

import com.agileflow.entity.Notification;
import com.agileflow.enums.NotificationStatus;
import com.agileflow.repository.NotificationRepository;
import com.agileflow.service.DeadlineNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/** Periodic job: (1) scan deadlines -> create notifications, (2) dispatch due/retryable ones asynchronously. */
@Component
public class DeadlineScheduler {
    private static final Logger log = LoggerFactory.getLogger(DeadlineScheduler.class);
    private final DeadlineNotificationService scanner;
    private final NotificationRepository notifications;
    private final NotificationProcessor processor;

    public DeadlineScheduler(DeadlineNotificationService scanner, NotificationRepository notifications, NotificationProcessor processor) {
        this.scanner = scanner; this.notifications = notifications; this.processor = processor;
    }

    @Scheduled(initialDelayString = "${agileflow.notifications.initial-delay-ms:5000}",
               fixedDelayString = "${agileflow.notifications.scan-interval-ms:60000}")
    public void run() {
        try {
            scanner.scanAndCreate();
            for (Notification n : notifications.findByStatusAndNextAttemptAtLessThanEqual(NotificationStatus.PENDING, LocalDateTime.now())) {
                processor.process(n.getId());
            }
        } catch (Exception e) {
            log.error("Deadline scheduler run failed", e);
        }
    }
}
