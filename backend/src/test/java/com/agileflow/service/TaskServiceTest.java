package com.agileflow.service;

import com.agileflow.dto.Dtos.TaskRequest;
import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock TaskRepository tasks;
    @Mock UserStoryRepository stories;
    @Mock ProjectMemberRepository members;
    @Mock UserRepository users;
    @Mock NotificationRepository notifications;
    @Mock AccessService access;
    @Mock ActivityService activity;
    @Mock Mapper mapper;
    @InjectMocks TaskService service;

    Project project; UserStory story;

    @BeforeEach
    void setUp() {
        project = new Project(); project.setId(10L);
        story = new UserStory(); story.setId(3L); story.setProject(project);
    }

    @Test
    void createRejectsAssigneeOutsideProject() {
        when(stories.findById(3L)).thenReturn(Optional.of(story));
        when(access.requireMember(10L, 1L)).thenReturn(project);
        when(members.existsByProjectIdAndUserId(10L, 99L)).thenReturn(false);
        TaskRequest r = new TaskRequest("T", null, 99L, Priority.HIGH, null, null, null);

        ApiException e = assertThrows(ApiException.class, () -> service.create(3L, r, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatus());
        verify(tasks, never()).save(any());
    }

    @Test
    void createRejectsDueDateBeforeStartDate() {
        when(stories.findById(3L)).thenReturn(Optional.of(story));
        when(access.requireMember(10L, 1L)).thenReturn(project);
        TaskRequest r = new TaskRequest("T", null, null, Priority.LOW, null, LocalDate.now(), LocalDate.now().minusDays(2));
        assertThrows(ApiException.class, () -> service.create(3L, r, 1L));
    }

    @Test
    void updateStatusPersistsAndLogsActivity() {
        Task t = new Task(); t.setId(5L); t.setTitle("Task"); t.setStory(story); t.setStatus(TaskStatus.TO_DO);
        when(tasks.findById(5L)).thenReturn(Optional.of(t));

        service.updateStatus(5L, TaskStatus.DONE, 1L);

        assertEquals(TaskStatus.DONE, t.getStatus());
        verify(tasks).save(t);
        verify(activity).log(eq(project), eq(1L), eq("MOVED"), eq("TASK"), eq(5L), anyString());
    }

    @Test
    void unauthorizedUserCannotChangeStatus() {
        Task t = new Task(); t.setId(5L); t.setStory(story); t.setStatus(TaskStatus.TO_DO);
        when(tasks.findById(5L)).thenReturn(Optional.of(t));
        when(access.requireMember(10L, 2L)).thenThrow(ApiException.forbidden("no"));

        assertThrows(ApiException.class, () -> service.updateStatus(5L, TaskStatus.DONE, 2L));
        verify(tasks, never()).save(any());
    }

    @Test
    void deleteRemovesNotificationsFirst() {
        Task t = new Task(); t.setId(5L); t.setTitle("x"); t.setStory(story);
        when(tasks.findById(5L)).thenReturn(Optional.of(t));
        service.delete(5L, 1L);
        var order = inOrder(notifications, tasks);
        order.verify(notifications).deleteByTaskId(5L);
        order.verify(tasks).delete(t);
    }
}
