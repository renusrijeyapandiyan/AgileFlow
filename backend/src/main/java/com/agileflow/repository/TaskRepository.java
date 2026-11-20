package com.agileflow.repository;

import com.agileflow.entity.Task;
import com.agileflow.enums.TaskStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStoryIdOrderByCreatedAtAsc(Long storyId);
    List<Task> findByStoryProjectIdOrderByCreatedAtAsc(Long projectId);
    List<Task> findByStoryProjectIdInOrderByCreatedAtDesc(Collection<Long> projectIds);
    long countByStoryId(Long storyId);
    long countByStoryIdAndStatus(Long storyId, TaskStatus status);
    long countByStoryProjectId(Long projectId);
    long countByStoryProjectIdAndStatus(Long projectId, TaskStatus status);
    long countByStoryProjectIdIn(Collection<Long> projectIds);
    long countByStoryProjectIdInAndStatus(Collection<Long> projectIds, TaskStatus status);
    long countByAssigneeIdAndStoryProjectId(Long assigneeId, Long projectId);
    List<Task> findByAssigneeIdAndStoryProjectId(Long assigneeId, Long projectId);

    @Query("select count(t) from Task t where t.story.project.id in :pids and t.status <> :done and t.dueDate < :today")
    long countOverdue(@Param("pids") Collection<Long> pids, @Param("done") TaskStatus done, @Param("today") LocalDate today);

    @Query("select t.status, count(t) from Task t where t.story.project.id in :pids group by t.status")
    List<Object[]> countByStatus(@Param("pids") Collection<Long> pids);

    @Query("select t from Task t where t.assignee is not null and t.status <> :done and t.dueDate is not null and t.dueDate <= :limit")
    List<Task> findDeadlineCandidates(@Param("done") TaskStatus done, @Param("limit") LocalDate limit);
}
