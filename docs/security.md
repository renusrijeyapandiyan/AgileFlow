# Security

* **Passwords:** BCrypt hashes only; never returned by any DTO. Min length 8 (max 72, BCrypt limit).
* **JWT (HS256, jjwt):** subject = user id, 24 h expiry (`JWT_EXPIRATION_MS`). Secret comes from `JWT_SECRET` (≥ 32 chars). If unset, a random secret is generated once and stored in `.agileflow-jwt-secret` (git-ignored) — no secret is hard-coded in the repo.
* **Stateless:** no sessions, CSRF disabled (token in `Authorization` header, not a cookie). The filter also verifies the user still exists.
* **Authorization:** every project-scoped read/write calls `AccessService` — non-members get 403. Only the owner can edit/delete a project and manage members. Tasks can only be assigned to project members. Notifications are only readable/markable by their owner.
* **Input validation:** Bean Validation on all request DTOs; malformed JSON/enum values → 400; no stack traces leak (`GlobalExceptionHandler`).
* **SQL injection:** only JPA/JPQL with bound parameters.
* **CORS:** explicit origin allow-list (`CORS_ALLOWED_ORIGINS`), explicit methods/headers.
* **Login errors** are generic ("Invalid email or password") to avoid user enumeration (registration still reveals duplicate emails — acceptable for this scope).

## Known trade-offs
* The JWT is stored in `localStorage` (simple, XSS-exposed). Production hardening: HttpOnly SameSite cookie + CSRF token, strict CSP.
* No login rate limiting / account lockout, no refresh tokens, no token revocation list.
* `GET /api/users` exposes names/e-mails of all registered users to any logged-in user (needed to invite members).
* Swagger UI is public; disable it in production (`springdoc.swagger-ui.enabled=false`).
