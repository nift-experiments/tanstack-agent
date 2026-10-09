# EXTERNAL-INPUTS.md

A pinned Git SHA does not necessarily define the complete production input
set. Inventory inputs that can move independently of Git or the toolchain.

Only fill in rows that apply; this is a checklist, not bureaucracy.

## Inventory

For each relevant input record: source URL/system; version/revision; captured
body/hash; capture date; deterministic (yes/no/unknown); can move independently
of Git SHA (yes/no); credentials required; cache boundary; must be frozen for
parity (yes/no).

| Input | Source | Version/revision | Captured hash | Date | Deterministic | Moves w/o Git | Creds | Cache boundary | Freeze |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | |

## Categories to consider

- network-fetched inputs;
- registry-derived inputs;
- generated API/reference data;
- environment-derived inputs;
- tool-version-derived inputs;
- search/index inputs;
- other generated publication inputs.

## T1 actual pinned-source findings

`docs-input-pins.json` records all 24 configured repository/ref pairs and exact public GitHub commits. `library-inputs.json` binds library/version/docs roots to those refs. Docs are read at runtime; a site Git SHA alone does not freeze them. Tree/menu/body capture remains in progress in the separate baseline workspace.

Hosted Algolia responses, public GitHub/npm stats, remote examples/catalogs/media and service configuration can move independently. These require explicit frozen public inputs or deterministic local transport fixtures. No production secrets, database state, OAuth, emails, feedback, AI, analytics or production webhook writes are permitted. Runtime/service contracts are preserved separately from actual live integration claims.
