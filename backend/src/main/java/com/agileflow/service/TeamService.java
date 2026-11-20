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
public class TeamService {
    private final UserRepository users;
    private final ProjectMemberRepository members;
    private final TaskRepository tasks;
    private final AccessService access;
    private final ActivityService activity;
    private final Mapper mapper;

    @Transactional
    public List<UserDto> allUsers() { return users.findAllByOrderByNameAsc().stream().map(mapper::user).toList(); }

    @Transactional
    public List<MemberDto> members(Long projectId, Long uid) {
        access.requireMember(projectId, uid);
        return members.findByProjectIdOrderByCreatedAtAsc(projectId).stream().map(m -> toDto(m, projectId)).toList();
    }

    @Transactional
    public MemberDto add(Long projectId, Long userId, Long uid) {
        Project p = access.requireOwner(projectId, uid);
        User u = users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (members.existsByProjectIdAndUserId(projectId, userId)) throw ApiException.conflict("User is already a member");
        ProjectMember m = new ProjectMember();
        m.setProject(p); m.setUser(u); m.setRole(MemberRole.MEMBER);
        m = members.save(m);
        activity.log(p, uid, "ADDED_MEMBER", "MEMBER", u.getId(), u.getName());
        return toDto(m, projectId);
    }

    @Transactional
    public void remove(Long projectId, Long userId, Long uid) { remove(projectId, userId, uid, false); }

    /** @param unassignTasks when true, the member's tasks in this project are unassigned instead of blocking the removal */
    @Transactional
    public void remove(Long projectId, Long userId, Long uid, boolean unassignTasks) {
        Project p = access.requireOwner(projectId, uid);
        ProjectMember m = members.findByProjectIdAndUserId(projectId, userId).orElseThrow(() -> ApiException.notFound("Member not found"));
        if (m.getRole() == MemberRole.OWNER) throw ApiException.badRequest("The project owner cannot be removed");
        if (tasks.countByAssigneeIdAndStoryProjectId(userId, projectId) > 0) {
            if (!unassignTasks) throw ApiException.conflict("Member still has assigned tasks. Reassign them first, or remove with unassignTasks=true.");
            tasks.findByAssigneeIdAndStoryProjectId(userId, projectId).forEach(t -> t.setAssignee(null));
        }
        activity.log(p, uid, "REMOVED_MEMBER", "MEMBER", userId, m.getUser().getName());
        members.delete(m);
    }

    private MemberDto toDto(ProjectMember m, Long projectId) {
        return new MemberDto(m.getUser().getId(), m.getUser().getName(), m.getUser().getEmail(), m.getRole(),
                tasks.countByAssigneeIdAndStoryProjectId(m.getUser().getId(), projectId));
    }
}
