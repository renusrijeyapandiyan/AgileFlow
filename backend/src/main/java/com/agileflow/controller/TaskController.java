package com.agileflow.controller;

import com.agileflow.dto.Dtos.*;
import com.agileflow.security.AuthUser;
import com.agileflow.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService tasks;

    @GetMapping("/tasks")
    public List<TaskResponse> all(@AuthenticationPrincipal AuthUser u) { return tasks.listAll(u.id()); }

    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> byProject(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId) { return tasks.listByProject(projectId, u.id()); }

    @GetMapping("/stories/{storyId}/tasks")
    public List<TaskResponse> byStory(@AuthenticationPrincipal AuthUser u, @PathVariable Long storyId) { return tasks.listByStory(storyId, u.id()); }

    @PostMapping("/stories/{storyId}/tasks")
    public ResponseEntity<TaskResponse> create(@AuthenticationPrincipal AuthUser u, @PathVariable Long storyId, @Valid @RequestBody TaskRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tasks.create(storyId, r, u.id()));
    }

    @GetMapping("/tasks/{id}")
    public TaskResponse get(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) { return tasks.get(id, u.id()); }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(@AuthenticationPrincipal AuthUser u, @PathVariable Long id, @Valid @RequestBody TaskRequest r) {
        return tasks.update(id, r, u.id());
    }

    @PatchMapping("/tasks/{id}/status")
    public TaskResponse status(@AuthenticationPrincipal AuthUser u, @PathVariable Long id, @Valid @RequestBody TaskStatusRequest r) {
        return tasks.updateStatus(id, r.status(), u.id());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) {
        tasks.delete(id, u.id());
        return ResponseEntity.noContent().build();
    }
}
