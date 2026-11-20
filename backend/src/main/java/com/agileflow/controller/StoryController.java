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
public class StoryController {
    private final StoryService stories;

    @GetMapping("/projects/{projectId}/stories")
    public List<StoryResponse> list(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId) { return stories.list(projectId, u.id()); }

    @PostMapping("/projects/{projectId}/stories")
    public ResponseEntity<StoryResponse> create(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @Valid @RequestBody StoryRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stories.create(projectId, r, u.id()));
    }

    @GetMapping("/stories/{id}")
    public StoryResponse get(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) { return stories.get(id, u.id()); }

    @PutMapping("/stories/{id}")
    public StoryResponse update(@AuthenticationPrincipal AuthUser u, @PathVariable Long id, @Valid @RequestBody StoryRequest r) {
        return stories.update(id, r, u.id());
    }

    @DeleteMapping("/stories/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthUser u, @PathVariable Long id) {
        stories.delete(id, u.id());
        return ResponseEntity.noContent().build();
    }
}
