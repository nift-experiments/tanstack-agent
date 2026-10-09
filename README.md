# TanStack.com: Nift + retained TanStack

This experiment publishes documentation inputs through Nift while retaining TanStack Start request-time rendering, React, Router, Query and backend services. Source model: **rendered-source hybrid: maintained document AST plus original/download projections**. This is a faithful intermediate local migration/evidence checkpoint, not a deployed replacement for tanstack.com.

Read [REPORT.md](REPORT.md) for parity, final measurements, limitations and the three-way maintenance assessment. [Retention ledger](investigation/RETAINED-TANSTACK.md) describes the actual ownership boundary. [Status](investigation/STATUS.md), [baseline](investigation/BASELINE.md) and [protocol](investigation/T10-PROTOCOL.md) bind the experiment.

## Build

The repository includes maintained docs and the pinned original runtime source/lockfile. Provision Node 25.9.0, pnpm 11.1.0 and Nift 4.9.0 in sibling `tanstack-baseline/toolchain` as described in [reproduction](investigation/REPRODUCTION.md), then install retained dependencies with the frozen lockfile. No credentials are required for local build.

```sh
python3 scripts/run-runtime.py pnpm install --frozen-lockfile
python3 scripts/run-runtime.py node ../scripts/publish.mjs --full
python3 scripts/run-runtime.py node ../scripts/publish.mjs
python3 scripts/run-runtime.py node ../scripts/publish.mjs --fresh
```

`--full` forces Vite, all required document preparation and Nift `build --all`. The normal command reuses an unchanged retained bundle and valid source/dependency caches. `--fresh` removes the defined owned application/output caches and forces the complete publication. Installed dependencies and OS page cache remain present. Output is `publication/client` plus `publication/server`; none of these commands deploys infrastructure or migrates a database.

Bare `nift build` composes already-prepared document packets and metadata. It is not the complete publisher, does not bundle React, and is not a substitute for the commands above. Markdown compatibility/AST derivation is a migration-side stage, not native `@markup` performance.

## Source ownership

Edit maintained document AST, originalRawMarkdown and downloadMarkdown coherently under sources/docs. Normal builds do not derive the migrated document corpus from Markdown. Original blog sources, partner-dependent hosting inputs and useful React/MDX representations remain where required.

Edit application components/services under `runtime/`. The retained app renders the shared shell and docs at request time; it is not a whole-page static snapshot. The complete publisher writes an immutable publication revision into Worker vars for safe manifest reuse. Static assets retain their original bytes.

## Local validation

```sh
python3 scripts/run-runtime.py node --import tsx ../scripts/corpus-contract.mts
python3 scripts/run-runtime.py node ../scripts/lifecycle-contract.mjs
```

Expanded browser/HTTP/local R2 contracts require the frozen baseline fixtures and local Workers documented in reproduction. All network writes/private providers are blocked in the fixture harness. UI parity, local transport and live integration are separate claims; live auth/database/AI/mail/tenant integration was not certified.

[Final numeric evidence](evidence/t10/summary.json), [raw samples](evidence/t10/samples.json), [component costs](evidence/t10/component-summary.json) and [initial evidence](evidence/t8/accepted-summary.json) are committed. Large raw build trees, logs, screenshots and archives remain outside Labs and these source trees. Future candidates are recorded separately in [FUTURE-WORK.md](investigation/FUTURE-WORK.md). No Nift core changes were made.
