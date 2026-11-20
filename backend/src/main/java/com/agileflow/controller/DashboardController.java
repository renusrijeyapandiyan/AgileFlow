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
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboard;

    @GetMapping("/summary")
    public DashboardSummary summary(@AuthenticationPrincipal AuthUser u) { return dashboard.summary(u.id()); }

    @GetMapping("/activity")
    public List<ActivityResponse> activity(@AuthenticationPrincipal AuthUser u) { return dashboard.activity(u.id()); }
}
