# Milestone 3 — Plant and asset registry

## Scope
This milestone adds tenant-scoped plant master data and an equipment registry. Plants contain production-line and work-cell definitions. Assets belong to an active plant and carry a unique organization-scoped asset code, category, lifecycle status, criticality, optional manufacturer/serial/model and acquisition/warranty data, operational location, and evidence references.

## API
- GET /api/v1/plants — list plants in the authenticated organization.
- POST /api/v1/plants — create a plant (owner, admin, plant manager).
- PATCH /api/v1/plants/:plantId — update a plant (owner, admin, plant manager).
- GET /api/v1/assets — paginated inventory with text search, plant/status/category/criticality filters and sorting.
- GET /api/v1/assets/:assetId — asset details and recent append-only history.
- POST /api/v1/assets — register an asset (owner, admin, plant manager, maintenance manager, production supervisor, quality manager).
- PATCH /api/v1/assets/:assetId — update asset metadata.
- PATCH /api/v1/assets/:assetId/status — request a validated lifecycle transition.

## Security and data integrity
- Every route authenticates the request and scopes queries by the verified req.auth.organizationId; request bodies cannot set tenant ownership.
- Asset registration requires an active plant in the same tenant. Production line and work-cell references are validated against that plant.
- Plant codes and asset codes are unique within an organization. Serial numbers are unique within an organization when supplied.
- Read access is available to authenticated members. Mutations use the existing operational role allow-list.
- Lifecycle changes are constrained by an explicit transition map. Creation, metadata updates and status transitions append history records; no history mutation endpoint exists.
- Evidence stores metadata and opaque secure references only. This milestone does not accept file uploads or expose public storage URLs.

## Lifecycle
commissioning → operational | standby | decommissioned; operational → standby | maintenance | decommissioned; standby → operational | maintenance | decommissioned; maintenance → operational | standby | decommissioned. Decommissioned is terminal.

## Verification
CI runs typecheck, build, lint and tests. Schema tests cover normalized codes, invalid coordinates, tenant-field rejection and lifecycle enum validation. Database-backed tests for cross-tenant access, uniqueness races and concurrent lifecycle updates remain a recommended hardening step.
