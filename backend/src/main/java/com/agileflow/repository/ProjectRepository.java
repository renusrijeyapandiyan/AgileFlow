package com.agileflow.repository;

import com.agileflow.entity.Project;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("select m.project from ProjectMember m where m.user.id = :uid order by m.project.createdAt desc")
    List<Project> findAccessible(@Param("uid") Long uid);
}
