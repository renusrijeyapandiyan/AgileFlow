# Architecture

```
┌──────────────────────┐   HTTPS/JSON + JWT    ┌───────────────────────────────────────────┐
│ React SPA (Vite)     │ ────────────────────▶ │ Spring Boot 3 (Java 17)                   │
│ Router · Axios       │ ◀──────────────────── │  controller → service → repository (JPA)  │
│ Tailwind · Recharts  │                       │  security (JWT filter) · exception advice │
└──────────────────────┘                       │  scheduler (@Scheduled) + @Async worker   │
                                               └───────────────┬───────────────────────────┘
                                                               │ Hibernate (SQLite dialect)
                                                        ┌──────▼──────┐
                                                        │ agileflow.db │
                                                        └─────────────┘
```

## Backend layers (`com.agileflow`)
| Package | Responsibility |
|---|---|
| `controller` | HTTP mapping, `@Valid` request validation, status codes. **No business logic.** |
| `service` | Business rules, authorization (`AccessService`), transactions, DTO mapping (`Mapper`). |
| `repository` | Spring Data JPA interfaces and queries. |
| `entity` / `enums` | JPA model (`BaseEntity` supplies id + created/updated timestamps). |
| `dto` | Request/response records (`Dtos`). Entities are never serialized. |
| `security` | `JwtService`, `JwtAuthFilter`, `AuthUser` principal. |
| `config` | Security/CORS, async executor, OpenAPI, SQLite date converters, demo `DataSeeder`. |
| `scheduler` | `DeadlineScheduler`, `NotificationProcessor` (@Async), `NotificationDeliverer`. |
| `exception` | `ApiException` + `GlobalExceptionHandler` (uniform `ApiError` JSON). |

## Frontend structure
`pages/` (11 routed pages) · `components/` (Modal, ConfirmDialog, forms, badges…) · `layouts/AppLayout` (sidebar) ·
`services/` (Axios instance + endpoint modules) · `context/` (Auth, Toast) · `hooks/` (`useFetch`, `useProjectSelection`) · `utils/`.

## Request flow
1. SPA attaches `Authorization: Bearer <jwt>`.
2. `JwtAuthFilter` validates the signature/expiry and that the user still exists, then sets `AuthUser`.
3. Controller → service. `AccessService.requireMember/requireOwner` enforces project membership for every project-scoped resource.
4. Service maps entities to DTOs inside the transaction (`open-in-view=false`).
