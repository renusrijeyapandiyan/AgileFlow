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
public class DashboardService {
    private final ProjectRepository projects;
    private final ProjectMemberRepository members;
    private final UserStoryRepository stories;
    private final TaskRepository tasks;
    private final ActivityLogRepository logs;
    private final Mapper mapper;

    @Transactional
    public DashboardSummary summary(Long uid) {
        List<Long> pids = members.findProjectIdsByUserId(uid);
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (TaskStatus s : TaskStatus.values()) byStatus.put(s.name(), 0L);
        if (pids.isEmpty()) return new DashboardSummary(0, 0, 0, 0, 0, 0, 0, byStatus, List.of());

        for (Object[] row : tasks.countByStatus(pids)) byStatus.put(((TaskStatus) row[0]).name(), (Long) row[1]);
        long total = tasks.countByStoryProjectIdIn(pids);
        long done = byStatus.get(TaskStatus.DONE.name());
        long overdue = tasks.countOverdue(pids, TaskStatus.DONE, LocalDate.now());
        int progress = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        List<ProjectProgress> pp = projects.findAccessible(uid).stream()
                .map(p -> new ProjectProgress(p.getId(), p.getName(), mapper.project(p).progress())).toList();
        return new DashboardSummary(pids.size(), stories.countByProjectIdIn(pids), total, done, total - done, overdue, progress, byStatus, pp);
    }

    @Transactional
    public List<ActivityResponse> activity(Long uid) {
        List<Long> pids = members.findProjectIdsByUserId(uid);
        if (pids.isEmpty()) return List.of();
        return logs.findTop15ByProjectIdInOrderByCreatedAtDesc(pids).stream()
                .map(a -> new ActivityResponse(a.getId(), a.getAction(), a.getEntityType(), a.getEntityId(), a.getDetails(),
                        a.getUser().getName(), a.getProject().getId(), a.getProject().getName(), a.getCreatedAt())).toList();
    }
}
