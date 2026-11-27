# ForgeOS

**Industrial Operations & Manufacturing Intelligence Platform**

ForgeOS is a multi-tenant manufacturing operations platform designed to help industrial teams coordinate production execution, machine availability, maintenance, quality inspections, and operational performance from a single system.

> Project status: Milestone 2 — enterprise identity and organization tenancy implemented on the feature branch; awaiting CI and review.

## Product vision

Manufacturing teams often manage production schedules, machine downtime, maintenance requests, quality checks, and shift handovers across disconnected tools. ForgeOS brings these operational workflows together with clear ownership, traceable state changes, and actionable production metrics.

## Target users

- Plant and operations managers
- Production supervisors and shift leads
- Maintenance engineers and technicians
- Quality assurance inspectors
- Industrial engineering and continuous-improvement teams
- Enterprise administrators managing multiple plants

## Core product areas

1. **Enterprise identity and tenancy** — organizations, plant membership, role-based permissions, and tenant isolation.
2. **Plant and asset registry** — plants, production lines, work cells, machines, and criticality.
3. **Production execution** — production orders, routing steps, shift plans, output capture, and order progress.
4. **Maintenance operations** — preventive/corrective work orders, assignment, downtime windows, and maintenance history.
5. **Quality management** — inspection plans, non-conformance records, disposition, and corrective actions.
6. **Operational intelligence** — OEE inputs and explainable metrics for availability, performance, quality, downtime, and throughput.
7. **Audit and traceability** — append-oriented business events, actor attribution, and operational history.

## Engineering principles

- Tenant scope is derived from authenticated membership, never trusted from client-supplied organization identifiers.
- Every state transition is validated server-side and recorded with actor and timestamp.
- Metrics expose their formulas and source data; no fabricated AI or sensor data is presented as real.
- Integrations (PLC/SCADA, ERP, MES, IoT gateways) are explicit adapters and are not simulated as connected systems.
- Operational commands are validated, permission-checked, and auditable.
- Production readiness requires automated tests, deployment configuration, observability, backup/recovery, and security review.

## Planned technology

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Validation: Zod
- Testing: Vitest / Node test runner / Supertest as appropriate
- Tooling: ESLint, Prettier, Docker Compose, GitHub Actions

## Delivery roadmap

| Milestone | Scope |
| --- | --- |
| 1. Platform foundation | Monorepo, typed API, environment validation, health checks, Docker, CI |
| 2. Enterprise identity | Authentication, organizations, membership, RBAC, tenant isolation — implemented on feature branch |
| 3. Plant & asset registry | Plants, lines, work cells, machines, criticality, asset lifecycle |
| 4. Production execution | Production orders, routing, shift plans, output reporting |
| 5. Maintenance operations | Work orders, assignment, downtime, maintenance history |
| 6. Quality management | Inspection plans, non-conformance, disposition, corrective action |
| 7. Operations intelligence | Explainable OEE, throughput, downtime and quality dashboards |
| 8. Enterprise hardening | Integration boundaries, audit verification, performance and security tests |

## Local development

Copy `.env.example` to `.env`, then run `docker compose up --build` to start MongoDB (single-node replica set) and the API. Start the web client with `npm run dev:web`. For a host-run API, configure a replica set whose advertised member hostname is reachable from the host. Never commit real credentials; use environment templates with placeholders only.

## Implemented identity milestone

- bcrypt password hashing, validated registration and login, signed short-lived access JWTs.
- HttpOnly refresh cookie with rotation, token-family reuse detection and session revocation.
- Organization, membership and operational role models with active-status checks on each request.
- Tenant context is derived from the access token and verified membership, not client-supplied organization IDs.
- Organization membership listing and role-restricted member provisioning for existing accounts.
- Authenticated React workspace, current organization context and owner/admin team access panel.
- MongoDB replica-set transactions for registration and refresh rotation.

See [Identity and tenancy documentation](docs/IDENTITY-AND-TENANCY.md). Plant registry and manufacturing domain workflows remain future milestones.

## Security disclosure

Do not use real plant credentials, production secrets, customer information, or sensitive industrial network details in issues or sample data. Report security concerns privately to the repository maintainer.
