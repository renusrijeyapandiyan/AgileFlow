package com.agileflow.service;

import com.agileflow.dto.Dtos.*;
import com.agileflow.entity.*;
import com.agileflow.enums.TaskStatus;
import com.agileflow.repository.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/** Entity -> DTO mapping. Must be called inside a transaction (lazy associations). */
@Component
public class Mapper {
    private final TaskRepository tasks;
    private final UserStoryRepository stories;
    private final ProjectMemberRepository members;

    public Mapper(TaskRepository tasks, UserStoryRepository stories, ProjectMemberRepository members) {
        this.tasks = tasks; this.stories = stories; this.members = members;
    }

    public UserDto user(User u) { return new UserDto(u.getId(), u.getName(), u.getEmail()); }

    public ProjectResponse project(Project p) {
        long total = tasks.countByStoryProjectId(p.getId());
        long done = tasks.countByStoryProjectIdAndStatus(p.getId(), TaskStatus.DONE);
        int progress = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        List<MemberDto> ms = members.findByProjectIdOrderByCreatedAtAsc(p.getId()).stream()
                .map(m -> new MemberDto(m.getUser().getId(), m.getUser().getName(), m.getUser().getEmail(), m.getRole(),
                        tasks.countByAssigneeIdAndStoryProjectId(m.getUser().getId(), p.getId())))
                .toList();
        return new ProjectResponse(p.getId(), p.getName(), p.getDescription(), p.getStartDate(), p.getDeadline(),
                p.getOwner().getId(), p.getOwner().getName(), progress, stories.countByProjectId(p.getId()), total, done, ms,
                p.getCreatedAt(), p.getUpdatedAt());
    }

    public StoryResponse story(UserStory s) {
        return new StoryResponse(s.getId(), s.getProject().getId(), s.getProject().getName(), s.getTitle(), s.getDescription(),
                s.getAcceptanceCriteria(), s.getPriority(), s.getStatus(), tasks.countByStoryId(s.getId()),
                tasks.countByStoryIdAndStatus(s.getId(), TaskStatus.DONE), s.getCreatedAt(), s.getUpdatedAt());
    }

    public TaskResponse task(Task t) {
        UserStory s = t.getStory();
        boolean overdue = t.getDueDate() != null && t.getStatus() != TaskStatus.DONE && t.getDueDate().isBefore(LocalDate.now());
        return new TaskResponse(t.getId(), s.getId(), s.getTitle(), s.getProject().getId(), s.getProject().getName(), t.getTitle(),
                t.getDescription(), t.getAssignee() == null ? null : t.getAssignee().getId(),
                t.getAssignee() == null ? null : t.getAssignee().getName(), t.getPriority(), t.getStatus(), t.getStartDate(),
                t.getDueDate(), overdue, t.getCreatedAt(), t.getUpdatedAt());
    }
}
