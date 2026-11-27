# ForgeOS

**Industrial Operations & Manufacturing Intelligence Platform**

ForgeOS is a multi-tenant manufacturing operations platform designed to help industrial teams coordinate production execution, machine availability, maintenance, quality inspections, and operational performance from a single system.

> Project status: foundation initialization. Features are considered implemented only when their API/UI behavior, tests, and documentation are present and verified.

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
| 2. Enterprise identity | Authentication, organizations, membership, RBAC, tenant isolation |
| 3. Plant & asset registry | Plants, lines, work cells, machines, criticality, asset lifecycle |
| 4. Production execution | Production orders, routing, shift plans, output reporting |
| 5. Maintenance operations | Work orders, assignment, downtime, maintenance history |
| 6. Quality management | Inspection plans, non-conformance, disposition, corrective action |
| 7. Operations intelligence | Explainable OEE, throughput, downtime and quality dashboards |
| 8. Enterprise hardening | Integration boundaries, audit verification, performance and security tests |

## Local development

Setup instructions will be added with the first runnable application milestone. Never commit real credentials; use environment templates with placeholders only.

## Security disclosure

Do not use real plant credentials, production secrets, customer information, or sensitive industrial network details in issues or sample data. Report security concerns privately to the repository maintainer.
