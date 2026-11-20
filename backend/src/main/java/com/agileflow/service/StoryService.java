package com.agileflow.service;

import com.agileflow.dto.Dtos.*;
import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final UserStoryRepository stories;
    private final TaskRepository tasks;
    private final AccessService access;
    private final ActivityService activity;
    private final Mapper mapper;

    @Transactional
    public List<StoryResponse> list(Long projectId, Long uid) {
        access.requireMember(projectId, uid);
        return stories.findByProjectIdOrderByCreatedAtDesc(projectId).stream().map(mapper::story).toList();
    }

    @Transactional
    public StoryResponse get(Long id, Long uid) { return mapper.story(load(id, uid)); }

    @Transactional
    public StoryResponse create(Long projectId, StoryRequest r, Long uid) {
        Project p = access.requireMember(projectId, uid);
        UserStory s = new UserStory();
        s.setProject(p);
        apply(s, r);
        s = stories.save(s);
        activity.log(p, uid, "CREATED", "STORY", s.getId(), s.getTitle());
        return mapper.story(s);
    }

    @Transactional
    public StoryResponse update(Long id, StoryRequest r, Long uid) {
        UserStory s = load(id, uid);
        apply(s, r);
        stories.save(s);
        activity.log(s.getProject(), uid, "UPDATED", "STORY", s.getId(), s.getTitle());
        return mapper.story(s);
    }

    /** A story that still has tasks cannot be deleted. */
    @Transactional
    public void delete(Long id, Long uid) {
        UserStory s = load(id, uid);
        if (tasks.countByStoryId(id) > 0) throw ApiException.conflict("Story still has tasks. Delete its tasks first.");
        activity.log(s.getProject(), uid, "DELETED", "STORY", s.getId(), s.getTitle());
        stories.delete(s);
    }

    private UserStory load(Long id, Long uid) {
        UserStory s = stories.findById(id).orElseThrow(() -> ApiException.notFound("User story not found"));
        access.requireMember(s.getProject().getId(), uid);
        return s;
    }

    private void apply(UserStory s, StoryRequest r) {
        s.setTitle(r.title().trim());
        s.setDescription(r.description());
        s.setAcceptanceCriteria(r.acceptanceCriteria());
        s.setPriority(r.priority());
        if (r.status() != null) s.setStatus(r.status());
    }
}
