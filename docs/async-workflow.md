# Background notification workflow

```
@Scheduled DeadlineScheduler.run()  (every 60 s, configurable)
   │ 1. DeadlineNotificationService.scanAndCreate()   [transaction]
   │      open tasks (status ≠ DONE) with assignee and due_date ≤ today + N days
   │      → INSERT notification(status=PENDING, retry_count=0, dedupe_key=TYPE:task:user:dueDate)
   │      → skipped if dedupe_key already exists (UNIQUE column = hard guarantee)
   │ 2. for each PENDING notification with next_attempt_at ≤ now:
   ▼
NotificationProcessor.process(id)   @Async("notificationExecutor")   [separate thread pool]
   ├─ deliver OK        → status=SENT, sent_at=now          (visible in the notification center)
   └─ deliver throws    → retry_count++, last_error=…
        ├─ retry_count < max-retries → stays PENDING, next_attempt_at = now + backoff × retry_count
        └─ retry_count ≥ max-retries → status=FAILED (terminal, kept for diagnosis)
```

* **Types:** `UPCOMING_DEADLINE` (due within `upcoming-days`, default 2) and `OVERDUE` (due date in the past).
* **No duplicates:** one notification per (type, task, assignee, due date). Changing the due date or the assignee legitimately creates a new one. Survives restarts because it is enforced in the database.
* **Retries:** the retry sweep is the same scheduler loop, so retries also survive restarts (state lives in the DB, not memory). An in-memory `inFlight` set stops the same id being processed twice concurrently.
* **Delivery channel:** `NotificationDeliverer` currently logs; replace its body with e-mail/Slack/push. Any exception triggers the retry path.
* **Visibility:** users only see `SENT` notifications. `retry_count`, `status` and `last_error` are stored on each row.

| Property (env var) | Default |
|---|---|
| `agileflow.notifications.scan-interval-ms` (`NOTIFY_SCAN_INTERVAL_MS`) | 60000 |
| `agileflow.notifications.upcoming-days` (`NOTIFY_UPCOMING_DAYS`) | 2 |
| `agileflow.notifications.max-retries` (`NOTIFY_MAX_RETRIES`) | 3 |
| `agileflow.notifications.retry-backoff-seconds` (`NOTIFY_RETRY_BACKOFF_SECONDS`) | 30 |

Demo data contains an overdue task and tasks due soon, so notifications appear ~5–10 s after first start.
