# Database schema (SQLite)

Schema is created/updated by Hibernate (`ddl-auto=update`). Foreign keys are enforced (`?foreign_keys=on` in the JDBC URL).
Dates/timestamps are stored as ISO-8601 text through JPA `AttributeConverter`s (SQLite has no native date type).

```
users 1─┬─* project_members *─┬─1 projects 1─* user_stories 1─* tasks *─0..1 users (assignee)
        ├─* notifications *─0..1 tasks
        └─* activity_logs *─1 projects
```

| Table | Key columns | Constraints / indexes |
|---|---|---|
| `users` | id PK, name, email, password_hash, created_at, updated_at | UNIQUE(email) |
| `projects` | id, name, description, start_date, deadline, **owner_id FK→users** | idx(owner_id) |
| `project_members` | id, **project_id FK**, **user_id FK**, role (OWNER/MEMBER) | UNIQUE(project_id,user_id); idx(user_id), idx(project_id) |
| `user_stories` | id, **project_id FK**, title, description, acceptance_criteria, priority, status | NOT NULL project_id/title/priority/status; idx(project_id), idx(status) |
| `tasks` | id, **story_id FK**, title, description, **assignee_id FK (nullable)**, priority, status, start_date, due_date | idx(story_id), idx(assignee_id), idx(status), idx(due_date) |
| `notifications` | id, **user_id FK**, **task_id FK (nullable)**, type, message, status (PENDING/SENT/FAILED), retry_count, is_read, dedupe_key, last_error, next_attempt_at, sent_at | **UNIQUE(dedupe_key)**; idx(user_id), idx(status) |
| `activity_logs` | id, **project_id FK**, **user_id FK**, action, entity_type, entity_id, details | idx(project_id), idx(created_at) |

All tables also have `created_at` and `updated_at` (NOT NULL, set by `@PrePersist/@PreUpdate`).

## Hierarchy and delete behaviour
Project (1─*) UserStory (1─*) Task.
* Deleting a **project** that still has user stories → `409 Conflict`. An empty project is deleted together with its membership rows and activity log.
* Deleting a **story** that still has tasks → `409 Conflict`.
* Deleting a **task** also deletes its notifications (explicit, in the same transaction).
* A member who still has assigned tasks cannot be removed from a project (409). The owner cannot be removed.
* No DB-level `ON DELETE CASCADE` is used on purpose, so a bug can never silently wipe a subtree.
