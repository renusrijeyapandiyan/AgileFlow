package com.agileflow.entity;

import com.agileflow.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks",
        indexes = {@Index(name = "idx_task_story", columnList = "story_id"), @Index(name = "idx_task_assignee", columnList = "assignee_id"),
                @Index(name = "idx_task_status", columnList = "status"), @Index(name = "idx_task_due", columnList = "due_date")})
@Getter @Setter @NoArgsConstructor
public class Task extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "story_id", nullable = false)
    private UserStory story;
    @Column(nullable = false, length = 200) private String title;
    @Column(length = 4000) private String description;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assignee_id")
    private User assignee;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Priority priority = Priority.MEDIUM;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TaskStatus status = TaskStatus.TO_DO;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "due_date") private LocalDate dueDate;
}
