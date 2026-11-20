package com.agileflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "projects", indexes = @Index(name = "idx_projects_owner", columnList = "owner_id"))
@Getter @Setter @NoArgsConstructor
public class Project extends BaseEntity {
    @Column(nullable = false, length = 150) private String name;
    @Column(length = 2000) private String description;
    @Column(name = "start_date") private LocalDate startDate;
    private LocalDate deadline;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}
