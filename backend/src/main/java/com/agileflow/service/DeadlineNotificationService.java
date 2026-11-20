package com.agileflow.service;

import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Scans open tasks with deadlines and creates PENDING notifications. A deterministic dedupe key
 * (type:task:user:dueDate, enforced by a UNIQUE column) guarantees no duplicates, even across restarts.
 */
@Service
public class DeadlineNotificationService {
    private static final Logger log = LoggerFactory.getLogger(DeadlineNotificationService.class);
    private final TaskRepository tasks;
    private final NotificationRepository notifications;
    private final int upcomingDays;

    public DeadlineNotificationService(TaskRepository tasks, NotificationRepository notifications,
                                       @Value("${agileflow.notifications.upcoming-days:2}") int upcomingDays) {
        this.tasks = tasks; this.notifications = notifications; this.upcomingDays = upcomingDays;
    }

    @Transactional
    public int scanAndCreate() {
        LocalDate today = LocalDate.now();
        int created = 0;
        for (Task t : tasks.findDeadlineCandidates(TaskStatus.DONE, today.plusDays(upcomingDays))) {
            boolean overdue = t.getDueDate().isBefore(today);
            NotificationType type = overdue ? NotificationType.OVERDUE : NotificationType.UPCOMING_DEADLINE;
            String key = type + ":" + t.getId() + ":" + t.getAssignee().getId() + ":" + t.getDueDate();
            if (notifications.existsByDedupeKey(key)) continue;

            Notification n = new Notification();
            n.setUser(t.getAssignee());
            n.setTask(t);
            n.setType(type);
            n.setDedupeKey(key);
            n.setStatus(NotificationStatus.PENDING);
            n.setNextAttemptAt(LocalDateTime.now());
            n.setMessage(message(t, today, overdue));
            notifications.save(n);
            created++;
        }
        if (created > 0) log.info("Deadline scan created {} notification(s)", created);
        return created;
    }

    private String message(Task t, LocalDate today, boolean overdue) {
        long days = ChronoUnit.DAYS.between(today, t.getDueDate());
        if (overdue) return "Task '" + t.getTitle() + "' is overdue (was due " + t.getDueDate() + ")";
        if (days == 0) return "Task '" + t.getTitle() + "' is due today";
        return "Task '" + t.getTitle() + "' is due in " + days + " day(s) (" + t.getDueDate() + ")";
    }
}
