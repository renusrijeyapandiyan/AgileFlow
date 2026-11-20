package com.agileflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_logs",
        indexes = {@Index(name = "idx_activity_project", columnList = "project_id"), @Index(name = "idx_activity_created", columnList = "created_at")})
@Getter @Setter @NoArgsConstructor
public class ActivityLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, length = 30) private String action;
    @Column(name = "entity_type", nullable = false, length = 30) private String entityType;
    @Column(name = "entity_id") private Long entityId;
    @Column(length = 500) private String details;
}
