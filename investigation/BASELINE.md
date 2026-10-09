# BASELINE.md

The frozen upstream reference. Complete this before migrating content.

## Upstream reference

- Upstream repository: https://github.com/TanStack/tanstack.com
- Upstream commit SHA: `862ccc3d191818320c3e6d217542883f80cb907a`
- Upstream source directory: sibling `tanstack-upstream` (clean detached immutable reference); separate `tanstack-baseline/build-work` for acquisition/build.
- Production build command: `pnpm build` (`vite build --logLevel warn`); never execute deployment/database migration scripts.
- Toolchain / runtime versions: Node 25.9.0 (`.nvmrc`), pnpm 11.1.0 (`packageManager`), frozen pnpm lockfile; Nift 4.9.0 initialized projects.
- Tool/binary hashes (where relevant):

## Source model

Choose exactly one and describe it:

- [ ] authored (human + agent; Markdown/MDX/frontmatter preserved)
- [x] rendered (agent-primary; rendered HTML/CSS/JS + explicit metadata/nav)
- [ ] hybrid (describe):

Publication/behaviour parity does not require different source models to
preserve identical source semantics.

## Complete production pipeline

A successful build is not necessarily the complete publication. List every
production step in order (build, search/index generation, post-processing,
API/reference generation, downloads/exports, asset processing, deployment
transforms, registry-generated data, client-island/bundle preparation, multi-stage re-builds):

1. Frozen dependency acquisition (outside timed publication).
2. `pnpm build`: content collections, CSS, React/TanStack browser and Worker bundles, static assets.
3. Publish `dist/client` alongside `dist/server` under the existing Cloudflare runtime contract. Infrastructure deployment and database migration are excluded. Hosted Algolia and runtime docs ingestion do not add an upstream build-time indexing stage.

## Frozen reference output

REFERENCE OUTPUT (immutable, upstream):
    /home/nick/Repositories/nift/nift-experiments/tanstack-baseline/reference-production-build1
MIGRATION OUTPUT (Nift, changes over time):
/home/nick/Repositories/nift/nift-experiments/tanstack-agent/public

Never point parity comparison at MIGRATION OUTPUT on both sides.

## Upstream nondeterminism classification

- [ ] byte deterministic
- [ ] semantic deterministic
- [ ] nondeterministic but bounded/understood (describe)
- [ ] unresolved

## Baseline measurements

- Upstream build time (method, median/range):
- Upstream peak RSS:
- Environment / hardware:

## T1 source inventory (not parity / concrete-page counts)

- 314 generated router path patterns, 322 route source files, 120 API path patterns.
- 171 server-function callsites; 80 local Markdown blog inputs.
- 244 tracked static assets / 111,985,406 bytes.
- 24 external docs repository/ref pairs resolved to exact commits; 7,601 files captured and verified against pinned Git blob IDs.
- T1 production baseline is accepted. Two fixed-path builds preserve identical SHA-256 values for all 1,867 files. Representative HTTP and 18 desktop/mobile UI states are frozen; full migration parity remains a later gate.
- Architecture inventory: `RETAINED-TANSTACK.md`; exact source input hashes: `upstream-surface-inventory.json`.
- Initial dependency download failed transiently; retry uses lower network concurrency with the lockfile still frozen. Dependency acquisition remains outside timed publication.

## Accepted T1 evidence

`baseline-summary.json` binds the raw receipts outside this source repository. Exact source, lockfile, external docs, assets and route inventories are retained. HTTP fixtures preserve the 307 docs redirect, Markdown negotiation, 404 and logged-out API responses. Browser fixtures cover marketing, blog, docs, themes, mobile navigation and a local empty Algolia response. Cloudflare asset precedence was corrected in the test harness; upstream code was untouched.

Public external blog feed is captured separately. Remote repository/npm statistics are synthetic test fixtures; auth/database/AI services remain unconfigured. This establishes UI and local-transport baselines, not live backend integration. Full transport/schema and richer interactive cases continue in T3/T7. Browser runner currently uses Playwright 1.63.0 and installed Chromium revision 1234; the final reproducible harness must provision its own pinned browser dependency.

Exploratory builds took 36.48s and 32.50s, with GNU time maximum individual-process/child-phase RSS of 4,550,324 and 4,689,336 KiB. These two smoke measurements are not final benchmark results. Runtime HTML carries hydration/cache timestamps, so production-artifact byte determinism does not imply request-response byte determinism.
