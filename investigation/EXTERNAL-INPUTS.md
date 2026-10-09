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
| External docs | 24 public GitHub repo/ref pairs | Exact commits in docs-input-pins.json | 7,601 original file hashes / Git blobs | Campaign capture | Yes, pinned | Yes | No | Native R2 or published corpus | Yes |
| Recursive source trees | Public GitHub | Exact same pins | evidence/fixtures/index.json (authored repository) | Campaign capture | Frozen bytes | Yes | No | Local GET fixture | Yes |
| Catalog examples/data | Public TanStack/charts | 57774e14a1a86081eddb3a23523724a40da05640 | Catalog capture Git blobs and SHA-256 | Campaign capture | Yes, pinned | Yes | No | Local runtime fixture | Yes |
| Browser module graph | Public esm.sh | 196 captured module responses | Committed frozen bytes / receipt hashes | Campaign capture | Frozen bytes | Yes | No | Browser request fixture | Yes |
| Public blog feed | eurosky.social | Captured cursor pages | Committed frozen bytes / receipt hashes | Campaign capture | Frozen bytes | Yes | No | Local GET fixture | Yes |
| Hosted search | Algolia | Retained hosted service | Controlled hit/filter fixtures | Test execution | Fixture only | Yes | No private credentials | Browser transport fixture | Yes |
| GitHub/npm statistics | Public APIs | Synthetic deterministic fixture values | fixture-provider.mjs | Test execution | Fixture only | Yes | No | Local GET fixture | Yes |
| Private providers | OAuth/database/AI/mail/storage | Retained original source | Source audit; live integration unverified | Not acquired | Not certified | Yes | Would require owned credentials | Blocked local outbound | Excluded |

## Categories to consider

- network-fetched inputs;
- registry-derived inputs;
- generated API/reference data;
- environment-derived inputs;
- tool-version-derived inputs;
- search/index inputs;
- other generated publication inputs.

## T1 actual pinned-source findings

`docs-input-pins.json` records all 24 configured repository/ref pairs and exact public GitHub commits. `library-inputs.json` binds library/version/docs roots to those refs. Docs are read at runtime; a site Git SHA alone does not freeze them. All tree/menu/body inputs were captured and verified before migration. Maintained docs source is committed; canonical frozen local transport/browser fixture bytes are committed once in the authored repository under evidence/fixtures. Exact public catalog inputs are reproducible from immutable commit/blob receipts; large archives/build trees/screenshots remain external. See REPRODUCTION.md.

Hosted Algolia responses, public GitHub/npm stats, remote examples/catalogs/media and service configuration can move independently. These require explicit frozen public inputs or deterministic local transport fixtures. No production secrets, database state, OAuth, emails, feedback, AI, analytics or production webhook writes are permitted. Runtime/service contracts are preserved separately from actual live integration claims.

The canonical authored fixture copy is shared test evidence, not a normalization of maintained source models or a routine agent Markdown renderer. Both normal publications build from their own committed source trees. Public acquisition, fixture capture and dependency installation are outside timed publication. Live private systems were never used.
