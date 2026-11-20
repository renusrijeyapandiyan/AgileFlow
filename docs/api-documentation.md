# REST API

Interactive docs: **http://localhost:8080/swagger-ui.html** (OpenAPI JSON at `/v3/api-docs`). Click *Authorize* and paste the JWT.
All endpoints except register/login require `Authorization: Bearer <token>`.
Errors share one shape: `{ timestamp, status, error, message, details{field:msg} }`.

| Method | Path | Description | Success |
|---|---|---|---|
| POST | /api/auth/register | Register (name, email, password ≥ 8) | 201 + token |
| POST | /api/auth/login | Login | 200 + token |
| GET/PUT | /api/auth/me | Current user / update name & password | 200 |
| GET | /api/projects | Projects I belong to | 200 |
| POST | /api/projects | Create (optional `memberIds`) | 201 |
| GET | /api/projects/{id} | Details + members + progress | 200 |
| PUT/DELETE | /api/projects/{id} | Owner only; delete blocked while stories exist | 200 / 204 |
| GET/POST | /api/projects/{projectId}/stories | List / create stories | 200 / 201 |
| GET/PUT/DELETE | /api/stories/{id} | Story CRUD (delete blocked while tasks exist) | 200 / 204 |
| GET/POST | /api/stories/{storyId}/tasks | List / create tasks | 200 / 201 |
| GET | /api/projects/{projectId}/tasks | All tasks of a project (Kanban) | 200 |
| GET | /api/tasks | All tasks in my projects | 200 |
| GET/PUT/DELETE | /api/tasks/{id} | Task CRUD | 200 / 204 |
| PATCH | /api/tasks/{id}/status | `{ "status": "TESTING" }` (Kanban move) | 200 |
| GET | /api/users | All users (to pick members) | 200 |
| GET/POST | /api/projects/{projectId}/members | List / add member (owner) `{userId}` | 200 / 201 |
| DELETE | /api/projects/{projectId}/members/{userId}?unassignTasks=false | Remove member (owner). Without `unassignTasks=true` a member who still has assigned tasks gives 409; with it, their tasks in the project are unassigned. The owner cannot be removed (400). | 204 |
| GET | /api/notifications | My delivered notifications | 200 |
| GET | /api/notifications/unread-count | `{count}` | 200 |
| PATCH | /api/notifications/{id}/read, /read-all | Mark read | 200 / 204 |
| GET | /api/dashboard/summary | Totals, overdue, progress, status counts | 200 |
| GET | /api/dashboard/activity | 15 most recent activities | 200 |

Status codes: 400 validation, 401 missing/invalid token or bad credentials, 403 not a project member / not owner, 404 not found, 409 conflict (duplicate email, protected delete).
Enums — Priority: `LOW MEDIUM HIGH CRITICAL`; StoryStatus: `TO_DO IN_PROGRESS DONE`; TaskStatus: `TO_DO IN_PROGRESS TESTING DONE`.
