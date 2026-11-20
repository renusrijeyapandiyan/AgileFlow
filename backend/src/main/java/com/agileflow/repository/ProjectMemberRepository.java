package com.agileflow.repository;

import com.agileflow.entity.ProjectMember;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    List<ProjectMember> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    @Query("select m.project.id from ProjectMember m where m.user.id = :uid")
    List<Long> findProjectIdsByUserId(@Param("uid") Long uid);
    @Modifying @Query("delete from ProjectMember m where m.project.id = :pid")
    void deleteByProjectId(@Param("pid") Long pid);
}
