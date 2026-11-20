package com.agileflow.service;

import com.agileflow.entity.Project;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Central project-level authorization: every project-scoped operation goes through here. */
@Service
@RequiredArgsConstructor
public class AccessService {
    private final ProjectRepository projects;
    private final ProjectMemberRepository members;

    @Transactional
    public Project requireMember(Long projectId, Long userId) {
        Project p = projects.findById(projectId).orElseThrow(() -> ApiException.notFound("Project not found"));
        if (!members.existsByProjectIdAndUserId(projectId, userId))
            throw ApiException.forbidden("You are not a member of this project");
        return p;
    }

    @Transactional
    public Project requireOwner(Long projectId, Long userId) {
        Project p = requireMember(projectId, userId);
        if (!p.getOwner().getId().equals(userId)) throw ApiException.forbidden("Only the project owner can do this");
        return p;
    }
}
