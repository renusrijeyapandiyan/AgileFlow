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
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projects;

    @GetMapping
    public List<ProjectResponse> list(@AuthenticationPrincipal AuthUser u) { return projects.list(u.id()); }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@AuthenticationPrincipal AuthUser u, @Valid @RequestBody ProjectRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projects.create(r, u.id()));
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) { return projects.get(id, u.id()); }

    @PutMapping("/{id}")
    public ProjectResponse update(@AuthenticationPrincipal AuthUser u, @PathVariable Long id, @Valid @RequestBody ProjectRequest r) {
        return projects.update(id, r, u.id());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) {
        projects.delete(id, u.id());
        return ResponseEntity.noContent().build();
    }
}
