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
public class TeamController {
    private final TeamService team;

    @GetMapping("/users")
    public List<UserDto> users() { return team.allUsers(); }

    @GetMapping("/projects/{projectId}/members")
    public List<MemberDto> members(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId) { return team.members(projectId, u.id()); }

    @PostMapping("/projects/{projectId}/members")
    public ResponseEntity<MemberDto> add(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @Valid @RequestBody AddMemberRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(team.add(projectId, r.userId(), r.jobTitle(), u.id()));
    }

    @PostMapping("/projects/{projectId}/members/invite")
    public ResponseEntity<MemberDto> invite(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @Valid @RequestBody InviteMemberRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(team.addByEmail(projectId, r.email(), r.jobTitle(), u.id()));
    }

    @PatchMapping("/projects/{projectId}/members/{userId}")
    public MemberDto update(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @PathVariable Long userId, @Valid @RequestBody UpdateMemberRequest r) {
        return team.updateMember(projectId, userId, r.jobTitle(), u.id());
    }

    @PostMapping("/projects/{projectId}/transfer-leadership")
    public ResponseEntity<Void> transfer(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @Valid @RequestBody TransferLeadershipRequest r) {
        team.transferLeadership(projectId, r.userId(), u.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/leave")
    public ResponseEntity<Void> leave(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId) {
        team.leave(projectId, u.id());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/projects/{projectId}/members/{userId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal AuthUser u, @PathVariable Long projectId, @PathVariable Long userId,
                                       @RequestParam(defaultValue = "false") boolean unassignTasks) {
        team.remove(projectId, userId, u.id(), unassignTasks);
        return ResponseEntity.noContent().build();
    }
}
