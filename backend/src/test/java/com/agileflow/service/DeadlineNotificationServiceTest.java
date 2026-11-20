package com.agileflow.service;

import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeadlineNotificationServiceTest {
    @Mock TaskRepository tasks;
    @Mock NotificationRepository notifications;

    private Task task(long id, LocalDate due) {
        User u = new User(); u.setId(5L);
        Task t = new Task(); t.setId(id); t.setTitle("Fix bug"); t.setAssignee(u); t.setDueDate(due); t.setStatus(TaskStatus.IN_PROGRESS);
        return t;
    }

    @Test
    void createsOverdueNotificationOnce() {
        DeadlineNotificationService svc = new DeadlineNotificationService(tasks, notifications, 2);
        when(tasks.findDeadlineCandidates(any(), any())).thenReturn(List.of(task(1L, LocalDate.now().minusDays(3))));
        when(notifications.existsByDedupeKey(anyString())).thenReturn(false);

        assertEquals(1, svc.scanAndCreate());

        ArgumentCaptor<Notification> c = ArgumentCaptor.forClass(Notification.class);
        verify(notifications).save(c.capture());
        assertEquals(NotificationType.OVERDUE, c.getValue().getType());
        assertEquals(NotificationStatus.PENDING, c.getValue().getStatus());
        assertEquals(0, c.getValue().getRetryCount());
        assertTrue(c.getValue().getMessage().contains("overdue"));
    }

    @Test
    void createsUpcomingNotification() {
        DeadlineNotificationService svc = new DeadlineNotificationService(tasks, notifications, 2);
        when(tasks.findDeadlineCandidates(any(), any())).thenReturn(List.of(task(2L, LocalDate.now().plusDays(1))));
        when(notifications.existsByDedupeKey(anyString())).thenReturn(false);
        svc.scanAndCreate();
        ArgumentCaptor<Notification> c = ArgumentCaptor.forClass(Notification.class);
        verify(notifications).save(c.capture());
        assertEquals(NotificationType.UPCOMING_DEADLINE, c.getValue().getType());
    }

    @Test
    void doesNotCreateDuplicates() {
        DeadlineNotificationService svc = new DeadlineNotificationService(tasks, notifications, 2);
        when(tasks.findDeadlineCandidates(any(), any())).thenReturn(List.of(task(1L, LocalDate.now().minusDays(1))));
        when(notifications.existsByDedupeKey(anyString())).thenReturn(true);

        assertEquals(0, svc.scanAndCreate());
        verify(notifications, never()).save(any());
    }
}
