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
public class TaskService {
    private final TaskRepository tasks;
    private final UserStoryRepository stories;
    private final ProjectMemberRepository members;
    private final UserRepository users;
    private final NotificationRepository notifications;
    private final AccessService access;
    private final ActivityService activity;
    private final Mapper mapper;

    @Transactional
    public List<TaskResponse> listByStory(Long storyId, Long uid) {
        UserStory s = story(storyId);
        access.requireMember(s.getProject().getId(), uid);
        return tasks.findByStoryIdOrderByCreatedAtAsc(storyId).stream().map(mapper::task).toList();
    }

    @Transactional
    public List<TaskResponse> listByProject(Long projectId, Long uid) {
        access.requireMember(projectId, uid);
        return tasks.findByStoryProjectIdOrderByCreatedAtAsc(projectId).stream().map(mapper::task).toList();
    }

    @Transactional
    public List<TaskResponse> listAll(Long uid) {
        List<Long> pids = members.findProjectIdsByUserId(uid);
        if (pids.isEmpty()) return List.of();
        return tasks.findByStoryProjectIdInOrderByCreatedAtDesc(pids).stream().map(mapper::task).toList();
    }

    @Transactional
    public TaskResponse get(Long id, Long uid) { return mapper.task(load(id, uid)); }

    @Transactional
    public TaskResponse create(Long storyId, TaskRequest r, Long uid) {
        UserStory s = story(storyId);
        Project p = access.requireMember(s.getProject().getId(), uid);
        Task t = new Task();
        t.setStory(s);
        apply(t, r, p.getId());
        t = tasks.save(t);
        activity.log(p, uid, "CREATED", "TASK", t.getId(), t.getTitle());
        return mapper.task(t);
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest r, Long uid) {
        Task t = load(id, uid);
        apply(t, r, t.getStory().getProject().getId());
        tasks.save(t);
        activity.log(t.getStory().getProject(), uid, "UPDATED", "TASK", t.getId(), t.getTitle());
        return mapper.task(t);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status, Long uid) {
        Task t = load(id, uid);
        TaskStatus old = t.getStatus();
        if (old != status) {
            t.setStatus(status);
            tasks.save(t);
            activity.log(t.getStory().getProject(), uid, "MOVED", "TASK", t.getId(), t.getTitle() + ": " + old + " -> " + status);
        }
        return mapper.task(t);
    }

    @Transactional
    public void delete(Long id, Long uid) {
        Task t = load(id, uid);
        activity.log(t.getStory().getProject(), uid, "DELETED", "TASK", t.getId(), t.getTitle());
        notifications.deleteByTaskId(id);
        tasks.delete(t);
    }

    private UserStory story(Long id) { return stories.findById(id).orElseThrow(() -> ApiException.notFound("User story not found")); }

    private Task load(Long id, Long uid) {
        Task t = tasks.findById(id).orElseThrow(() -> ApiException.notFound("Task not found"));
        access.requireMember(t.getStory().getProject().getId(), uid);
        return t;
    }

    private void apply(Task t, TaskRequest r, Long projectId) {
        if (r.startDate() != null && r.dueDate() != null && r.dueDate().isBefore(r.startDate()))
            throw ApiException.badRequest("Due date cannot be before the start date");
        if (r.assigneeId() == null) {
            t.setAssignee(null);
        } else {
            if (!members.existsByProjectIdAndUserId(projectId, r.assigneeId()))
                throw ApiException.badRequest("Assignee must be a member of the project");
            t.setAssignee(users.getReferenceById(r.assigneeId()));
        }
        t.setTitle(r.title().trim());
        t.setDescription(r.description());
        t.setPriority(r.priority());
        if (r.status() != null) t.setStatus(r.status());
        t.setStartDate(r.startDate());
        t.setDueDate(r.dueDate());
    }
}
