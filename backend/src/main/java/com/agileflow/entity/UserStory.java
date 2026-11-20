package com.agileflow.entity;

import com.agileflow.enums.*;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_stories",
        indexes = {@Index(name = "idx_story_project", columnList = "project_id"), @Index(name = "idx_story_status", columnList = "status")})
@Getter @Setter @NoArgsConstructor
public class UserStory extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @Column(nullable = false, length = 200) private String title;
    @Column(length = 4000) private String description;
    @Column(name = "acceptance_criteria", length = 4000) private String acceptanceCriteria;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Priority priority = Priority.MEDIUM;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private StoryStatus status = StoryStatus.TO_DO;
}
