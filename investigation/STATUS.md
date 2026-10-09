# STATUS.md

Resumable migration state. A new agent should be able to read `AGENTS.md`,
`MIGRATION.md`, this file and `HANDOVER.md` and know exactly where the
migration is without reconstructing history.

## Phases

Mark each: not started / in progress / blocked / done.

| Phase | Status | Acceptance criteria | Required evidence | Commands | Commit |
| --- | --- | --- | --- | --- | --- |
| 1 Baseline frozen | | | | | |
| 2 Parity contract + fixtures | | | | | |
| 3 Initial Nift structure + compatibility proof | | | | | |
| 4 Shared shells/templates | | | | | |
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
| T2 replace/retain/coexist map | in progress | Resolve publication freshness and retained-runtime ownership before T3. |
| T3 representative hybrid proof | not started | Only after reproducible upstream baseline. |
| T4–T10 corpus/runtime/parity/profile/final campaign | not started | Follow generated method and explicit user parity/benchmark contract. |

This experiment finds the best Nift + TanStack boundary. React, Router, Query, Start and backend services remain where useful. No Nift core changes are authorized.
