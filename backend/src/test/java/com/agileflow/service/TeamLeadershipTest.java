package com.agileflow.service;

import com.agileflow.entity.*;
import com.agileflow.enums.MemberRole;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamLeadershipTest {
    @Mock UserRepository users;
    @Mock ProjectMemberRepository members;
    @Mock TaskRepository tasks;
    @Mock AccessService access;
    @Mock ActivityService activity;
    @Mock Mapper mapper;
    @InjectMocks TeamService service;

    private Project project; private User leader; private User member;
    private ProjectMember leaderPm; private ProjectMember memberPm;

    @BeforeEach
    void setUp() {
        leader = new User(); leader.setId(10L); leader.setName("Lead");
        member = new User(); member.setId(2L); member.setName("Alex");
        project = new Project(); project.setId(1L); project.setOwner(leader);
        leaderPm = new ProjectMember(); leaderPm.setProject(project); leaderPm.setUser(leader); leaderPm.setRole(MemberRole.OWNER);
        memberPm = new ProjectMember(); memberPm.setProject(project); memberPm.setUser(member); memberPm.setRole(MemberRole.MEMBER);
    }

    @Test
    void transferLeadershipSwapsRolesAndOwner() {
        when(access.requireOwner(1L, 10L)).thenReturn(project);
        when(members.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.of(memberPm));
        when(members.findByProjectIdAndUserId(1L, 10L)).thenReturn(Optional.of(leaderPm));
        service.transferLeadership(1L, 2L, 10L);
        assertEquals(member, project.getOwner());
        assertEquals(MemberRole.OWNER, memberPm.getRole());
        assertEquals(MemberRole.MEMBER, leaderPm.getRole());
    }

    @Test
    void transferToNonMemberIsRejected() {
        when(access.requireOwner(1L, 10L)).thenReturn(project);
        when(members.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> service.transferLeadership(1L, 2L, 10L));
        assertEquals(leader, project.getOwner());
    }

    @Test
    void leaderCannotLeave() {
        when(access.requireMember(1L, 10L)).thenReturn(project);
        assertThrows(ApiException.class, () -> service.leave(1L, 10L));
        verify(members, never()).delete(any(ProjectMember.class));
    }

    @Test
    void memberLeavesAndTasksAreUnassigned() {
        Task t = new Task(); t.setAssignee(member);
        when(access.requireMember(1L, 2L)).thenReturn(project);
        when(members.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.of(memberPm));
        when(tasks.findByAssigneeIdAndStoryProjectId(2L, 1L)).thenReturn(List.of(t));
        service.leave(1L, 2L);
        assertNull(t.getAssignee());
        verify(members).delete(memberPm);
    }

    @Test
    void memberCannotChangeAnotherMembersTitle() {
        when(access.requireMember(1L, 2L)).thenReturn(project);
        assertThrows(ApiException.class, () -> service.updateMember(1L, 10L, "CEO", 2L));
    }
}
