package com.agileflow.repository;

import com.agileflow.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    List<UserStory> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    long countByProjectId(Long projectId);
    long countByProjectIdIn(Collection<Long> projectIds);
}
