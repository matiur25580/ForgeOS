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
- `docs`: architecture decisions, API contracts, threat model and operational runbooks.

## Reliability baseline

- Environment variables are validated at process startup.
- Liveness is independent of database availability.
- Readiness reports MongoDB connectivity and returns HTTP 503 when unavailable.
- API requests are size-limited, rate-limited and protected with Helmet defaults.
- CORS allows only the configured browser origin.
- Process shutdown closes the HTTP server and MongoDB connection.

## Security boundaries

This foundation does not yet provide user authentication or tenant authorization. Do not expose it to untrusted production traffic until Milestone 2 is implemented and reviewed. Secrets must be supplied through deployment environment configuration and must never be committed.
