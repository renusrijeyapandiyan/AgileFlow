package com.agileflow.dto;

import com.agileflow.enums.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** All request/response DTOs. Entities are never exposed directly. */
public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(@NotBlank @Size(max = 100) String name,
                                  @NotBlank @Email @Size(max = 150) String email,
                                  @NotBlank @Size(min = 8, max = 72) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record UserDto(Long id, String name, String email) {}
    public record AuthResponse(String token, UserDto user) {}
    public record ProfileRequest(@NotBlank @Size(max = 100) String name, String currentPassword,
                                 @Size(min = 8, max = 72) String newPassword) {}

    public record ProjectRequest(@NotBlank @Size(max = 150) String name, @Size(max = 2000) String description,
                                 LocalDate startDate, LocalDate deadline, List<Long> memberIds) {}
    public record MemberDto(Long userId, String name, String email, MemberRole role, long assignedTasks) {}
    public record ProjectResponse(Long id, String name, String description, LocalDate startDate, LocalDate deadline,
                                  Long ownerId, String ownerName, int progress, long storyCount, long taskCount,
                                  long doneTaskCount, List<MemberDto> members, LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record AddMemberRequest(@NotNull Long userId) {}

    public record StoryRequest(@NotBlank @Size(max = 200) String title, @Size(max = 4000) String description,
                               @Size(max = 4000) String acceptanceCriteria, @NotNull Priority priority, StoryStatus status) {}
    public record StoryResponse(Long id, Long projectId, String projectName, String title, String description,
                                String acceptanceCriteria, Priority priority, StoryStatus status, long taskCount,
                                long doneTaskCount, LocalDateTime createdAt, LocalDateTime updatedAt) {}

    public record TaskRequest(@NotBlank @Size(max = 200) String title, @Size(max = 4000) String description, Long assigneeId,
                              @NotNull Priority priority, TaskStatus status, LocalDate startDate, LocalDate dueDate) {}
    public record TaskStatusRequest(@NotNull TaskStatus status) {}
    public record TaskResponse(Long id, Long storyId, String storyTitle, Long projectId, String projectName, String title,
                               String description, Long assigneeId, String assigneeName, Priority priority, TaskStatus status,
                               LocalDate startDate, LocalDate dueDate, boolean overdue, LocalDateTime createdAt, LocalDateTime updatedAt) {}

    public record NotificationResponse(Long id, NotificationType type, String message, NotificationStatus status,
                                       int retryCount, boolean read, Long taskId, Long projectId, LocalDateTime createdAt) {}

    public record ProjectProgress(Long id, String name, int progress) {}
    public record DashboardSummary(long totalProjects, long totalStories, long totalTasks, long completedTasks, long pendingTasks,
                                   long overdueTasks, int progress, Map<String, Long> tasksByStatus, List<ProjectProgress> projectProgress) {}
    public record ActivityResponse(Long id, String action, String entityType, Long entityId, String details,
                                   String userName, Long projectId, String projectName, LocalDateTime createdAt) {}

    public record ApiError(LocalDateTime timestamp, int status, String error, String message, Map<String, String> details) {}
}
