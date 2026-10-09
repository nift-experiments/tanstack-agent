# Migration project

This project is being migrated to Nift. This README is a concise operational
entry point; the full method is in MIGRATION.md.

- Status: see `investigation/STATUS.md`.
- Upstream reference: see `investigation/BASELINE.md`.
- Source model (authored / rendered / hybrid): see `investigation/BASELINE.md`.
- Architecture: Nift generation may compose with independently prepared browser-side islands/bundles.
- Production-equivalent build: <record command in investigation/BASELINE.md>.
- Validation / parity command: <record command in investigation/PARITY-CONTRACT.md>.
- Method: `MIGRATION.md`. Current state: `HANDOVER.md`. Agent instructions: `AGENTS.md`.

The initial Nift scaffold is placeholder material and must not be counted as
migrated content in parity or benchmark claims.

## TanStack.com hybrid experiment

This is Nift **alongside TanStack**, with rendered maintained source. Nift may own publication/composition; React/TanStack and services retain application/runtime responsibilities where appropriate. Current checkpoint: T4 corpus validation. Starter checks: `nift build --all`, `nift build`, `nift status`. Complete publication and parity commands will be recorded after upstream investigation.

## T3 production boundary

The shared TanStack shell remains request-rendered because its root loader generates a new partner-placement seed per session. A whole-page cache prototype was rejected for freezing that behavior. Nift instead publishes document projections and explicit input metadata alongside retained Vite browser/Worker bundles. `runtime/src/server.ts` remains byte-identical to upstream. All service implementations remain intact.

For the authored repository, Markdown/frontmatter remain maintained source and the normal publication derives the TanStack document projection. For the agent repository, rich docs maintain that projection directly; their Markdown download text is an explicit maintained projection, not a renderer input during ordinary publication. Marketing/app React code remains useful and is retained. This is a hybrid/pre-derived model rather than a claim that every page is maintained HTML.

Historical T3 representative commands (reproduce at the T3 checkpoint; current publication uses the T4 command below):

```sh
python3 scripts/run-runtime.py pnpm install --frozen-lockfile
python3 scripts/run-runtime.py pnpm build
python3 scripts/run-runtime.py node ../scripts/proof-compose.mjs
python3 scripts/run-runtime.py node ../scripts/proof-server.mjs 4022
```

Browser publication: `publication/client`; retained Worker: `publication/server`. Raw evidence is outside this source repository. T3 source edits, tabs/code copy, client navigation, themes/mobile controls, Query view switching, search fixtures, Markdown downloads and fresh partner seeds are checked before corpus scaling. No live database/auth/AI integration is claimed.

## Complete corpus publication

See `investigation/T4-CORPUS.md` for the three content contracts, bounded ownership, retained dynamic exceptions and current validation scope. With the pinned toolchain provisioned, run:

```sh
python3 scripts/run-runtime.py node ../scripts/publish.mjs --full
python3 scripts/run-runtime.py node ../scripts/publish.mjs
python3 scripts/run-runtime.py node --import tsx ../scripts/corpus-contract.mts
python3 scripts/run-runtime.py node ../scripts/lifecycle-contract.mjs
```

The first command forces the complete retained build; the second publishes changed inputs and reuses an unchanged runtime bundle. Neither deploys to an external account.
