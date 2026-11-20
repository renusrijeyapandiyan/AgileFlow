package com.agileflow.scheduler;

import com.agileflow.entity.Notification;
import com.agileflow.enums.NotificationStatus;
import com.agileflow.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** Asynchronously delivers a notification, recording status, retry count and last error. */
@Component
public class NotificationProcessor {
    private static final Logger log = LoggerFactory.getLogger(NotificationProcessor.class);
    private final NotificationRepository repo;
    private final NotificationDeliverer deliverer;
    private final int maxRetries;
    private final long backoffSeconds;
    private final Set<Long> inFlight = ConcurrentHashMap.newKeySet();

    public NotificationProcessor(NotificationRepository repo, NotificationDeliverer deliverer,
                                 @Value("${agileflow.notifications.max-retries:3}") int maxRetries,
                                 @Value("${agileflow.notifications.retry-backoff-seconds:30}") long backoffSeconds) {
        this.repo = repo; this.deliverer = deliverer; this.maxRetries = maxRetries; this.backoffSeconds = backoffSeconds;
    }

    @Async("notificationExecutor")
    public void process(Long id) {
        if (!inFlight.add(id)) return; // already being processed
        try {
            Notification n = repo.findById(id).orElse(null);
            if (n == null || n.getStatus() != NotificationStatus.PENDING) return;
            try {
                deliverer.deliver(n);
                n.setStatus(NotificationStatus.SENT);
                n.setSentAt(LocalDateTime.now());
                n.setLastError(null);
            } catch (Exception e) {
                n.setRetryCount(n.getRetryCount() + 1);
                String msg = String.valueOf(e.getMessage());
                n.setLastError(msg.substring(0, Math.min(msg.length(), 500)));
                if (n.getRetryCount() >= maxRetries) {
                    n.setStatus(NotificationStatus.FAILED);
                    log.error("Notification #{} permanently failed after {} attempts", id, n.getRetryCount());
                } else {
                    n.setNextAttemptAt(LocalDateTime.now().plusSeconds(backoffSeconds * n.getRetryCount()));
                    log.warn("Notification #{} failed (attempt {}), will retry", id, n.getRetryCount());
                }
            }
            repo.save(n);
        } finally {
            inFlight.remove(id);
        }
    }
}
