package com.agileflow.repository;

import com.agileflow.entity.Notification;
import com.agileflow.enums.NotificationStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.*;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    boolean existsByDedupeKey(String dedupeKey);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, NotificationStatus status);
    long countByUserIdAndStatusAndReadFalse(Long userId, NotificationStatus status);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    List<Notification> findByStatusAndNextAttemptAtLessThanEqual(NotificationStatus status, LocalDateTime now);
    @Modifying @Query("delete from Notification n where n.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
