# STATUS.md

Resumable migration state. A new agent should be able to read `AGENTS.md`,
`MIGRATION.md`, this file and `HANDOVER.md` and know exactly where the
migration is without reconstructing history.

## Phases

Mark each: not started / in progress / blocked / done.

| Phase | Status | Acceptance criteria | Required evidence | Commands | Commit |
| --- | --- | --- | --- | --- | --- |
| 1 Baseline frozen | done | Fixed-path repeated production build | baseline-summary.json | pnpm build | T1 |
| 2 Parity contract + fixtures | done | Representative UI/local transport contract | t3-proof-summary.json | baseline fixture scripts | T3 |
| 3 Initial Nift structure + compatibility proof | done | Authored derivation / agent projection / raw dependency composition | t3-content-composition.json, t3-incremental-proof.json | proof-compose.mjs | T3 |
| 4 Shared shells/templates | done | Request-dependent shell retained unchanged; Nift input template proved | RETAINED-TANSTACK.md | dynamic-shell-contract.py | T3 |
| 5 Authored content | | | | | |
| 6 Source compatibility | | | | | |
| 7 Route/content/render/browser/behaviour parity | | | | | |
| 8 Incremental correctness | | | | | |
| 9 Performance campaign | | Profiles, general improvements or justified deferrals | | | |
| 10 Final parity revalidation | | Complete parity contract after optimization | | | |
| 11 Final benchmark campaign | | Optimized, parity-certified production pipeline | | | |
| 12 Clean-checkout verification | | | | | |
| 13 Handover / final report | | | | | |

GATE: compatibility proof must precede broad content translation. Do not mark
phase 5 in progress until phases 1-4 acceptance criteria are met.
GATE: complete parity precedes profiling/optimization; full parity revalidation
after the campaign precedes final benchmarking.

## Architecture and campaign evidence

- Significant retained/introduced islands and reasons (parity, source model,
  accessibility, shared state, maintenance and bundle/runtime cost):
- Island/bundle preparation and mounting commands:
- Profiles/hotspots and before/after measurements:
- General improvements, tradeoffs and deliberately deferred bottlenecks:

## Current

- Checkpoint:
- Commit SHA:
- Known blockers:
- Next checkpoint:

## Experiment checkpoints

| Checkpoint | Status | Gate / next action |
| --- | --- | --- |
| T0 setup/init | done | Public repository created; generated guidance read; starter full/incremental/status checks pass. |
| T1 pinned upstream baseline | done | Production output frozen and repeated byte-identically; external docs verified; HTTP + 18 browser baseline states frozen. See baseline-summary.json. |
| T2 replace/retain/coexist map | done | Explicit retained-runtime/public-document boundary and fair runtime docs-update treatment recorded. T3 must prove it. |
| T3 representative hybrid proof | done | Nift document projections + unchanged dynamic TanStack shell pass representative checks; frozen whole-page cache rejected. |
| T4 main static/content corpus | done | 7,601 inputs; 7,527 nonempty document projections; 25 owned docs roots; raw byte/AST/lifecycle/full-test/84-state browser gates pass. |
| T5 retained runtime/services | in progress | Confirm unchanged service implementations and local transport boundaries; no live provider integration claim. |
| T6–T10 generated/parity/profile/final campaign | not started | Follow generated method and explicit user parity/benchmark contract. |

This experiment finds the best Nift + TanStack boundary. React, Router, Query, Start and backend services remain where useful. No Nift core changes are authorized.
