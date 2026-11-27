# Enterprise identity, organization membership and access control

Milestone 2 introduces the authenticated tenant boundary used by subsequent ForgeOS domain modules.

## Identity model

- A user has a globally unique, normalized email address and a bcrypt password hash.
- An organization has a globally unique slug and an active/suspended lifecycle.
- A membership joins one user to one organization and carries an operational role.
- A session belongs to one user and one organization. It stores only a SHA-256 hash of a high-entropy opaque refresh token.
- Membership and organization status are rechecked on every authenticated API request; role changes take effect without waiting for an access token to expire.

## Authentication lifecycle

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Create user, organization, owner membership and session |
| POST | `/api/v1/auth/login` | Verify credentials and create an organization-scoped session |
| POST | `/api/v1/auth/refresh` | Rotate refresh token and issue a short-lived access token |
| POST | `/api/v1/auth/logout` | Revoke the current session |
| GET | `/api/v1/auth/me` | Return the authenticated user and active organization |
| GET | `/api/v1/organizations` | List active organization memberships |
| POST | `/api/v1/organizations` | Create another organization and owner membership |
| POST | `/api/v1/organizations/:organizationId/members` | Add an existing account to the active organization |

Access tokens are signed JWTs with issuer, audience, subject, organization and session claims. They are intended to be short-lived (15 minutes by default). Refresh tokens are random opaque values stored as hashes and sent only in an HttpOnly, SameSite=Lax cookie scoped to the auth routes. Refresh rotates the token and revokes the prior session. Reuse of a revoked refresh token revokes the remaining sessions in its token family.

Registration requires a password of at least 12 characters. Passwords are hashed with bcrypt. Login supports an organization slug when an account has multiple memberships; it does not silently choose an arbitrary tenant.

## Organization roles

- `owner`, `admin`: organization administration and membership management
- `plant_manager`: plant-level operations leadership
- `production_supervisor`: production execution oversight
- `maintenance_manager`, `maintenance_technician`: maintenance operations
- `quality_manager`, `quality_inspector`: quality workflow responsibilities
- `operator`: permitted operational data entry
- `auditor`: read-oriented audit access for future modules
- `viewer`: read-only workspace access

Role values are validated against a fixed allow-list. Only an owner can grant another owner role. Membership creation currently requires the invited email to already belong to a registered ForgeOS account; email invitations and acceptance flows are not part of this milestone.

## Tenant isolation rules

- Organization context is taken from the verified access token and then checked against an active membership.
- Client-supplied organization IDs are never accepted as the source of tenant authorization.
- Authenticated requests verify user, organization, membership and session status.
- A session is bound to one organization; the organization selector is required at login for users with multiple active memberships.
- Cross-organization resource access is denied by the authentication boundary before domain routes execute.

## Persistence and local development

Registration and refresh rotation use MongoDB transactions. MongoDB must run as a replica set. The supplied Docker Compose service starts a single-node replica set and initializes it through its health check. Use the Compose-managed API service when running against that containerized replica set; a host-run API needs a replica set whose advertised member address is reachable from the host.

## Verification and remaining hardening

- API schema tests cover registration password policy, email validation, organization selection and membership role allow-lists.
- CI performs TypeScript typecheck, build, lint and tests.
- Before production use, add database-backed integration tests for refresh-token replay, concurrent rotation, cross-tenant denial, owner succession, membership revocation and transaction rollback.
- Add shared rate-limit storage for multi-instance deployments, security event export, account recovery, MFA, session management UI, invitation workflows and organization switching.
- This milestone does not claim plant registry, production execution, maintenance, quality or live machine telemetry functionality.
