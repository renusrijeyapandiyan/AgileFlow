package com.agileflow.entity;

import com.agileflow.enums.MemberRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_members",
        uniqueConstraints = @UniqueConstraint(name = "uk_project_member", columnNames = {"project_id", "user_id"}),
        indexes = {@Index(name = "idx_pm_user", columnList = "user_id"), @Index(name = "idx_pm_project", columnList = "project_id")})
@Getter @Setter @NoArgsConstructor
public class ProjectMember extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private MemberRole role = MemberRole.MEMBER;
    @Column(name = "job_title", length = 80)
    private String jobTitle;
}
