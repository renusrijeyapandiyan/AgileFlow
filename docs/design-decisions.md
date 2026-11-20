# Design decisions & trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| SQLite via `hibernate-community-dialects` | Zero-install, file persistence | Single writer; pool is capped at 1 connection to avoid `SQLITE_BUSY`; limited `ALTER TABLE` so use Flyway for real schema migrations |
| Dates as ISO text via converters | Avoids SQLite/JDBC date quirks; sortable | Not native date columns |
| `ddl-auto=update` | Fast bootstrap | Replace by Flyway/Liquibase for production |
| DTO records + one `Mapper` | Entities (lazy proxies) never serialized | Some N+1 queries for counts; fine at team scale |
| Owner is also a `project_members` row | Single membership check everywhere | Owner row must never be removed (enforced) |
| Protected deletes (409) instead of cascades | "Prevent accidental deletion" | Users delete bottom-up (tasks → stories → project) |
| Scheduler creates rows, async worker delivers | Decouples detection from delivery; retries are durable | Up to one scan interval of latency |
| Dedupe key + UNIQUE index | Correct under restarts/concurrency | One notification per due date; reassigning notifies the new assignee |
| Native HTML5 drag-and-drop for Kanban | No extra dependency | No touch drag on some mobile browsers (status can still be changed on the Tasks page) |
| Optimistic Kanban updates with rollback | Snappy UI | Brief flicker if the server rejects the move |
| Tailwind v3 + hand-built components | Small, consistent, no UI-kit lock-in | More markup |
