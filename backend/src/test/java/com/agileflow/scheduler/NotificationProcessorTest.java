package com.agileflow.scheduler;

import com.agileflow.entity.Notification;
import com.agileflow.enums.NotificationStatus;
import com.agileflow.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationProcessorTest {
    @Mock NotificationRepository repo;
    @Mock NotificationDeliverer deliverer;

    private Notification pending() {
        Notification n = new Notification(); n.setId(1L); n.setStatus(NotificationStatus.PENDING); return n;
    }

    @Test
    void successfulDeliveryMarksSent() {
        Notification n = pending();
        when(repo.findById(1L)).thenReturn(Optional.of(n));
        new NotificationProcessor(repo, deliverer, 3, 0).process(1L);
        assertEquals(NotificationStatus.SENT, n.getStatus());
        assertNotNull(n.getSentAt());
        assertEquals(0, n.getRetryCount());
        verify(repo).save(n);
    }

    @Test
    void failureIncrementsRetryThenFailsPermanently() {
        Notification n = pending();
        when(repo.findById(1L)).thenReturn(Optional.of(n));
        doThrow(new RuntimeException("smtp down")).when(deliverer).deliver(any());
        NotificationProcessor p = new NotificationProcessor(repo, deliverer, 3, 0);

        p.process(1L);
        assertEquals(NotificationStatus.PENDING, n.getStatus());
        assertEquals(1, n.getRetryCount());
        assertEquals("smtp down", n.getLastError());
        p.process(1L);
        assertEquals(NotificationStatus.PENDING, n.getStatus());
        p.process(1L);
        assertEquals(NotificationStatus.FAILED, n.getStatus());
        assertEquals(3, n.getRetryCount());

        p.process(1L); // terminal state: no more attempts
        verify(deliverer, times(3)).deliver(any());
    }

    @Test
    void ignoresAlreadySentNotifications() {
        Notification n = pending(); n.setStatus(NotificationStatus.SENT);
        when(repo.findById(1L)).thenReturn(Optional.of(n));
        new NotificationProcessor(repo, deliverer, 3, 0).process(1L);
        verifyNoInteractions(deliverer);
        verify(repo, never()).save(any());
    }
}
