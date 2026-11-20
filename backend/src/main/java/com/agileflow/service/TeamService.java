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
    public MemberDto add(Long projectId, Long userId, Long uid) { return add(projectId, userId, null, uid); }

    @Transactional
    public MemberDto add(Long projectId, Long userId, String jobTitle, Long uid) {
        Project p = access.requireOwner(projectId, uid);
        User u = users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        return addUser(p, u, jobTitle, uid);
    }

    /** Add a registered user to the project by e-mail address. */
    @Transactional
    public MemberDto addByEmail(Long projectId, String email, String jobTitle, Long uid) {
        Project p = access.requireOwner(projectId, uid);
        User u = users.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> ApiException.notFound("No registered user with that email. Ask them to create an account first."));
        return addUser(p, u, jobTitle, uid);
    }

    private MemberDto addUser(Project p, User u, String jobTitle, Long uid) {
        if (members.existsByProjectIdAndUserId(p.getId(), u.getId())) throw ApiException.conflict("User is already a member");
        ProjectMember m = new ProjectMember();
        m.setProject(p); m.setUser(u); m.setRole(MemberRole.MEMBER); m.setJobTitle(clean(jobTitle));
        m = members.save(m);
        activity.log(p, uid, "ADDED_MEMBER", "MEMBER", u.getId(), u.getName());
        return toDto(m, p.getId());
    }

    /** The team leader can change anyone's job title; a member can change their own. */
    @Transactional
    public MemberDto updateMember(Long projectId, Long userId, String jobTitle, Long uid) {
        Project p = access.requireMember(projectId, uid);
        if (!p.getOwner().getId().equals(uid) && !uid.equals(userId))
            throw ApiException.forbidden("Only the team leader can change another member's title");
        ProjectMember m = members.findByProjectIdAndUserId(projectId, userId).orElseThrow(() -> ApiException.notFound("Member not found"));
        m.setJobTitle(clean(jobTitle));
        activity.log(p, uid, "UPDATED_MEMBER", "MEMBER", userId, m.getUser().getName());
        return toDto(m, projectId);
    }

    /** Hand the team leader role to another existing member. The previous leader stays on as a member. */
    @Transactional
    public void transferLeadership(Long projectId, Long newLeaderId, Long uid) {
        Project p = access.requireOwner(projectId, uid);
        if (newLeaderId.equals(uid)) throw ApiException.badRequest("You are already the team leader");
        ProjectMember next = members.findByProjectIdAndUserId(projectId, newLeaderId)
                .orElseThrow(() -> ApiException.notFound("The new leader must already be a member of the project"));
        ProjectMember current = members.findByProjectIdAndUserId(projectId, uid).orElseThrow(() -> ApiException.notFound("Member not found"));
        current.setRole(MemberRole.MEMBER);
        next.setRole(MemberRole.OWNER);
        p.setOwner(next.getUser());
        activity.log(p, uid, "TRANSFERRED_LEADERSHIP", "MEMBER", newLeaderId, next.getUser().getName());
    }

    /** A non-leader member leaves the project; their open tasks become unassigned. */
    @Transactional
    public void leave(Long projectId, Long uid) {
        Project p = access.requireMember(projectId, uid);
        if (p.getOwner().getId().equals(uid)) throw ApiException.badRequest("The team leader cannot leave. Transfer leadership first.");
        ProjectMember m = members.findByProjectIdAndUserId(projectId, uid).orElseThrow(() -> ApiException.notFound("Member not found"));
        tasks.findByAssigneeIdAndStoryProjectId(uid, projectId).forEach(t -> t.setAssignee(null));
        activity.log(p, uid, "LEFT_PROJECT", "MEMBER", uid, m.getUser().getName());
        members.delete(m);
    }

    private static String clean(String s) { return s == null || s.isBlank() ? null : s.trim(); }

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

    private MemberDto toDto(ProjectMember m, Long projectId) { return mapper.member(m, projectId); }
}
