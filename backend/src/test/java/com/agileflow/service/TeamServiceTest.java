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
class TeamServiceTest {
    @Mock UserRepository users;
    @Mock ProjectMemberRepository members;
    @Mock TaskRepository tasks;
    @Mock AccessService access;
    @Mock ActivityService activity;
    @Mock Mapper mapper;
    @InjectMocks TeamService service;

    private Project project; private User member; private ProjectMember pm;

    @BeforeEach
    void setUp() {
        project = new Project();
        member = new User(); member.setName("Alex");
        pm = new ProjectMember(); pm.setProject(project); pm.setUser(member); pm.setRole(MemberRole.MEMBER);
        when(access.requireOwner(1L, 10L)).thenReturn(project);
        when(members.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.of(pm));
    }

    @Test
    void removeWithoutTasksDeletesMember() {
        when(tasks.countByAssigneeIdAndStoryProjectId(2L, 1L)).thenReturn(0L);
        service.remove(1L, 2L, 10L);
        verify(members).delete(pm);
    }

    @Test
    void removeWithTasksIsRejectedByDefault() {
        when(tasks.countByAssigneeIdAndStoryProjectId(2L, 1L)).thenReturn(2L);
        assertThrows(ApiException.class, () -> service.remove(1L, 2L, 10L));
        verify(members, never()).delete(any(ProjectMember.class));
    }

    @Test
    void removeWithUnassignClearsAssigneesAndDeletesMember() {
        Task t1 = new Task(); t1.setAssignee(member);
        Task t2 = new Task(); t2.setAssignee(member);
        when(tasks.countByAssigneeIdAndStoryProjectId(2L, 1L)).thenReturn(2L);
        when(tasks.findByAssigneeIdAndStoryProjectId(2L, 1L)).thenReturn(List.of(t1, t2));
        service.remove(1L, 2L, 10L, true);
        assertNull(t1.getAssignee());
        assertNull(t2.getAssignee());
        verify(members).delete(pm);
    }

    @Test
    void ownerCannotBeRemoved() {
        pm.setRole(MemberRole.OWNER);
        assertThrows(ApiException.class, () -> service.remove(1L, 2L, 10L, true));
        verify(members, never()).delete(any(ProjectMember.class));
    }
}
