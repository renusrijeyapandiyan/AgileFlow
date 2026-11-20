package com.agileflow.service;

import com.agileflow.entity.*;
import com.agileflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityLogRepository logs;
    private final UserRepository users;

    @Transactional
    public void log(Project project, Long userId, String action, String entityType, Long entityId, String details) {
        ActivityLog a = new ActivityLog();
        a.setProject(project);
        a.setUser(users.getReferenceById(userId));
        a.setAction(action);
        a.setEntityType(entityType);
        a.setEntityId(entityId);
        a.setDetails(details == null ? null : details.substring(0, Math.min(details.length(), 500)));
        logs.save(a);
    }
}
