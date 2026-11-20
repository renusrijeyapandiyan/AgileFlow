package com.agileflow.repository;

import com.agileflow.entity.ActivityLog;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop15ByProjectIdInOrderByCreatedAtDesc(Collection<Long> projectIds);
    List<ActivityLog> findTop30ByProjectIdOrderByCreatedAtDesc(Long projectId);
    @Modifying @Query("delete from ActivityLog a where a.project.id = :pid")
    void deleteByProjectId(@Param("pid") Long pid);
}
