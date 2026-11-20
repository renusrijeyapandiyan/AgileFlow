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
public class ProjectService {
    private final ProjectRepository projects;
    private final ProjectMemberRepository members;
    private final UserRepository users;
    private final UserStoryRepository stories;
    private final ActivityLogRepository logs;
    private final AccessService access;
    private final ActivityService activity;
    private final Mapper mapper;

    @Transactional
    public List<ProjectResponse> list(Long uid) { return projects.findAccessible(uid).stream().map(mapper::project).toList(); }

    @Transactional
    public ProjectResponse get(Long id, Long uid) { return mapper.project(access.requireMember(id, uid)); }

    @Transactional
    public ProjectResponse create(ProjectRequest r, Long uid) {
        validateDates(r);
        User owner = users.findById(uid).orElseThrow(() -> ApiException.unauthorized("User not found"));
        Project p = new Project();
        apply(p, r);
        p.setOwner(owner);
        p = projects.save(p);
        addMember(p, owner, MemberRole.OWNER);
        if (r.memberIds() != null) {
            for (Long id : new LinkedHashSet<>(r.memberIds())) {
                if (id.equals(uid)) continue;
                addMember(p, users.findById(id).orElseThrow(() -> ApiException.notFound("User " + id + " not found")), MemberRole.MEMBER);
            }
        }
        activity.log(p, uid, "CREATED", "PROJECT", p.getId(), p.getName());
        return mapper.project(p);
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest r, Long uid) {
        validateDates(r);
        Project p = access.requireOwner(id, uid);
        apply(p, r);
        projects.save(p);
        activity.log(p, uid, "UPDATED", "PROJECT", p.getId(), p.getName());
        return mapper.project(p);
    }

    /** Projects that still contain user stories cannot be deleted (prevents accidental data loss). */
    @Transactional
    public void delete(Long id, Long uid) {
        Project p = access.requireOwner(id, uid);
        if (stories.countByProjectId(id) > 0)
            throw ApiException.conflict("Project still has user stories. Delete its stories first.");
        logs.deleteByProjectId(id);
        members.deleteByProjectId(id);
        projects.delete(p);
    }

    private void addMember(Project p, User u, MemberRole role) {
        ProjectMember m = new ProjectMember();
        m.setProject(p); m.setUser(u); m.setRole(role);
        members.save(m);
    }

    private void apply(Project p, ProjectRequest r) {
        p.setName(r.name().trim());
        p.setDescription(r.description());
        p.setStartDate(r.startDate());
        p.setDeadline(r.deadline());
    }

    private void validateDates(ProjectRequest r) {
        if (r.startDate() != null && r.deadline() != null && r.deadline().isBefore(r.startDate()))
            throw ApiException.badRequest("Deadline cannot be before the start date");
    }
}
