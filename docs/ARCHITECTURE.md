# ForgeOS architecture

## Initial deployment topology

```text
React + Vite browser client
          |
          | HTTPS / JSON
          v
Express API (versioned under /api/v1)
          |
          +-- Request validation and security middleware
          +-- Authentication / authorization (Milestone 2)
          +-- Domain modules (plant, production, maintenance, quality)
          |
          v
MongoDB / Mongoose
```

## Application boundaries

- `apps/web`: browser UI; never holds database credentials or server secrets.
- `apps/api`: API, domain logic, persistence, authorization and integration adapters.
- `apps/api/src/models`: user, organization, membership and refresh-session persistence.
- `apps/api/src/security`: password hashing and signed access-token verification.
- `apps/api/src/services`: identity lifecycle, refresh rotation and tenant membership workflows.
- `docs`: architecture decisions, API contracts, threat model and operational runbooks.

## Reliability baseline

- Environment variables are validated at process startup.
- Liveness is independent of database availability.
- Readiness reports MongoDB connectivity and returns HTTP 503 when unavailable.
- API requests are size-limited, rate-limited and protected with Helmet defaults.
- CORS allows only the configured browser origin.
- Process shutdown closes the HTTP server and MongoDB connection.

## Security boundaries

Milestone 2 implements bearer-token authentication, rotating HttpOnly refresh sessions, active membership checks and organization-scoped request context. This is a portfolio implementation, not a completed production identity provider; MFA, recovery, external audit export, shared rate limiting and deeper database-backed security tests remain required. Secrets must be supplied through deployment environment configuration and must never be committed.
