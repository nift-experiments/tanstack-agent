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
| 5 Authored content | done | Maintained source model and complete pinned input corpus | T4-CORPUS.md | publish.mjs | T4 |
| 6 Source compatibility | done | Original bounded resolver/AST and retained dynamic exceptions | t4-corpus-summary.json | corpus-contract.mts | T4 |
| 7 Route/content/render/browser/behaviour parity | done | 333 browser states, real charts, search, local APIs/generated outputs | evidence/t9/validation-summary.json | corpus-browser.mjs --expanded | T7/T9 |
| 8 Incremental correctness | done | Transitive refs, owned lifecycle and verified revisions | evidence/t9/validation-summary.json | ref-invalidation-contract.mjs | T9 |
| 9 Performance campaign | done | Profiles and practical producer/runtime optimization | T8-PROFILING.md, T9-OPTIMIZATION.md | initial-campaign.py | T8/T9 |
| 10 Final parity revalidation | done | Full optimized contract and fresh byte-equivalent output | evidence/t9/validation-summary.json | required suites / browser gates | T9 |
| 11 Final benchmark campaign | done | 225 five-sample serialized same-window timing/RSS rows | evidence/t10/summary.json | final-campaign.py | T10 |
| 12 Clean-checkout verification | done | Fresh clone, frozen install and complete publisher validation | evidence/t10/closeout.json | REPRODUCTION.md | T10 |
| 13 Handover / final report | in progress | Explicit ownership, maintenance judgement and guidance review | REPORT.md, MIGRATION-INIT-REVIEW.md | evidence/link checks | T10 |

GATE: compatibility proof must precede broad content translation. Do not mark
phase 5 in progress until phases 1-4 acceptance criteria are met.
GATE: complete parity precedes profiling/optimization; full parity revalidation
after the campaign precedes final benchmarking.

## Current

T0–T10 form a faithful intermediate checkpoint. An additional performance pass is authorized: preserve before/after evidence, profile wall time and memory, verify bundle reuse/corruption repair/force bypass, evaluate concurrency, optimize migration-side work, revalidate and rerun all 225 samples. Do not close or publish yet. No demonstrated blockers. The request-time application/runtime is retained; Nift owns documentation input/projection publication and asset orchestration. Complete bundling remains part of publication when required. The five-sample campaign, initial/rejected evidence, guidance review and engineering judgement are in REPORT.md and evidence/t10. Large raw artifacts remain in the external baseline workspace; Labs and Nift core remain untouched.

Future work is explicitly separated in FUTURE-WORK.md. Do not reopen the completed experiment merely to improve a graph.

## Experiment checkpoints

| Checkpoint | Status | Gate / next action |
| --- | --- | --- |
| T0 setup/init | done | Public repository created; generated guidance read; starter full/incremental/status checks pass. |
| T1 pinned upstream baseline | done | Production output frozen and repeated byte-identically; external docs verified; HTTP + 18 browser baseline states frozen. See baseline-summary.json. |
| T2 replace/retain/coexist map | done | Explicit retained-runtime/public-document boundary and fair runtime docs-update treatment recorded. T3 must prove it. |
| T3 representative hybrid proof | done | Nift document projections + unchanged dynamic TanStack shell pass representative checks; frozen whole-page cache rejected. |
| T4 main static/content corpus | done | 7,601 inputs; 7,527 nonempty document projections; 25 owned docs roots; raw byte/AST/lifecycle/full-test/84-state browser gates pass. |
| T5 retained runtime/services | done | All API/Worker/backend source preserved; 27 local HTTP states and real local R2 cache/invalidation contracts pass. |
| T6 generated outputs/search | done | 244 assets byte-equal; 30 generated HTTP states, six search-hit states and successful dynamic PNG parity; 188 real catalog cases available. |
| T7 expanded parity | done | 333 cross-library/version/viewport states plus six real catalog rendering and keyboard states pass; T3–T6 contracts retained. |
| T8 initial profiling | done | Three serialized samples; rejected force-command cohort retained; CPU profiles and compiled native R2 refresh proof captured. |
| T9 optimization | done | Corpus, transitive dependency, lifecycle, revision, required suites and expanded browser/service gates pass; fresh publication byte-identical. |
| T10 final campaign | done | 225 samples, component/memory scopes, clean-checkout verification, maintenance judgement and init review recorded. |

This experiment finds the best Nift + TanStack boundary. React, Router, Query, Start and backend services remain where useful. No Nift core changes are authorized.
