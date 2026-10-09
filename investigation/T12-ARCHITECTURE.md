# T12 — architectural ownership investigation

The faithful checkpoint remains the default. Replacing Vite with the pinned official TanStack Start/Rsbuild adapter works in the scoped local production proof, but does not transfer request-time HTML ownership to Nift. It lowers full-build memory and slows warm full publication. Two attempts to give Nift more HTML ownership fail required behavior or maintained-source authority. Expansion stops at those gates; no TanStack library reimplementation, production backend mutation, secrets or Nift core change follows.

T10's 225 measurements and accepted faithful commits are preserved unchanged. T11's verified publication/cache improvements are independently committed (authored `fb3ee8b`, rendered `4f846aa`). This investigation adds 80 samples for two valid agent variants and eight workloads. It does not replace the still-pending T11 three-implementation/15-workload/225-row campaign, close the experiment, or authorize a Labs publication.

## Ownership, rather than a Nift versus TanStack headline

| Responsibility | Upstream | A: faithful Nift agent | B: alternative engine | C: proposed Nift article/static ownership |
|---|---|---|---|---|
| Maintained docs publication | Original input/runtime pipeline | Nift-side document packets/projections | Same as A | Same packets plus bounded HTML experiment |
| Request-time public page/docs HTML | Start/React/Redact SSR | Retained Start/React/Redact SSR | Retained Start/React/Redact SSR | Static shell fails freshness; article bridge loses HTML authority after mounting |
| Browser Router/Query/Table/AI/React | Vite-compiled original libraries | Retained original libraries/Vite | Retained original libraries/official Start Rsbuild adapter | Original components retained in narrow proof |
| Server functions/serialization | Start compiler/runtime | Retained | Retained official alternate compiler/runtime | Not reimplemented |
| API/auth/chat/R2/DO/workflows | Cloudflare Worker | Original Worker services | Original Worker services, Worker-targeted Rsbuild emission | Real separate backend in rejected static proof |
| CSS/blog generation | Vite plugins | Retained | Standalone Tailwind/Content Collections | No accepted replacement |
| Full build ownership | Application compiler | Application compiler dominates; Nift composes prepared inputs | Alternate application compiler still dominates | No eligible timing |

The authored migration retains maintained Markdown and references. The agent migration retains document AST envelopes with original/download projections; it is a rendered-source hybrid, not whole maintained HTML. These source models remain distinct. A/B measurements here both use the agent model. Bare Nift composition is not the complete publication command, and these are not native `@markup` measurements.

## Dependency inventory

The committed import inventory classifies React, Router, Query, Table and AI as product/runtime dependencies. Start also supplies server functions, serialization, SSR and hydration; stripping its transformations is not equivalent to replacing a bundler. Literal import-file counts are React 512, Router 443, Query 143, Table 12, AI 80, Start 64, Sentry 7 and Content Collections 2. These are file incidence, not package cost or function counts. Redact is required through original Vite alias configuration despite zero literal imports. Its original alias map is preserved.

Vite has no required runtime role; an official adapter can replace its build responsibility. Tailwind and Content Collections can use standalone compilers. Sentry runtime remains; authenticated upload is not part of the measured environment. Local-docs/local-AI/devtools are development support; bundle analysis is diagnostic. Their removal is not counted as a production speedup. The complete classified table and file inventory are in `investigation/t12-prototypes`.

## Prototypes and boundaries

**A** retains Start/Vite, with input and output checks before bundle reuse. Runtime source edits rebuild both environments; normal document edits reuse verified bundles.

**B1: plain esbuild** fails compilation with 204 server/virtual-module browser-graph errors. No server handler stubs or silent externalization made it “work.” Failed compilation is not an eligible publication timing.

**B2: official Start/Rsbuild adapter** builds both browser and backend. It requires a bounded Worker integration: original Redact aliases, Tailwind PostCSS, standalone blog generation, fatal client import protection, browser route identities for seven server-only API/preview modules (real server handlers unchanged), and original Takumi workerd WASM loader/binary. Octane's explicitly unused Node-only Vite-adapter imports receive throwing browser accessors only inside Octane; non-Octane Node imports remain fatal. The first executable variant failed dynamic OG; that rejection is preserved. Corrected output passes the real PNG-byte contract. This is a framework-aware alternate engine, not a tiny generic bundler or Start elimination. [Official Rsbuild adapter guidance](https://www.rsbuild.dev/guide/migration/tanstack-start) also distinguishes build-engine migration from hosting integration.

**C1: whole-page Nift HTML plus real backend** freezes partner-placement session seeds. The separately live backend rotates seeds, but the published page does not. Rejected for actual required behavior loss; no fake replacement is accepted.

**C2: narrow article HTML bridge** changes four application adapters, not libraries, on three representative React pages (ordinary article, table, tabs/code). Twelve scoped browser states and real tab/mobile navigation match. An HTML-only maintained-source edit publishes normally with the unchanged backend bundle reused and appears in real SSR HTML. It disappears after original React Markdown components mount, because their unchanged AST remains authoritative. No browser error explains away the failure. Thus this is rejected as a single maintained-HTML architecture, despite initially matching output. Keeping synchronized HTML and a full shadow AST adds coordination; changing the island boundary needs further design beyond this bounded campaign. Do not scale or benchmark this as a successful migration.

## Complete publication measurements

Five serialized samples per cell; seconds show median [minimum–maximum]. Both required browser and backend compilation, content publication, asset publication and Worker configuration belong in the clock. There is no hidden service build. Fresh means fresh application state, not flushed OS caches. Normal docs updates reuse runtime bundles in both A and B. Rename/delete use the faithful journal/restoration and retirement checks. Shared-host load is recorded; cohorts have fixed order, so overlapping ranges do not establish a winner. Dependency acquisition is excluded. The performance cohort uses a shared frozen installed runtime tree with a separately locked adapter toolchain; independent-install reproduction is a separate correctness gate, not these timings.

| Workload | A: faithful Start/Vite | B: Start/Rsbuild |
|---|---:|---:|
| full | 32.94 [30.50–36.83] | 41.55 [40.10–43.20] |
| fresh | 46.30 [39.92–49.81] | 44.53 [42.50–57.54] |
| unchanged | 2.61 [2.56–3.04] | 2.89 [2.74–3.18] |
| body-1 | 2.54 [2.53–2.62] | 2.74 [2.67–2.95] |
| shared-shell | 32.12 [30.35–32.65] | 35.05 [35.01–37.14] |
| island | 34.61 [30.52–37.52] | 35.10 [34.33–35.91] |
| route-rename | 3.59 [3.55–3.73] | 3.27 [3.21–3.62] |
| route-delete | 3.82 [3.26–4.46] | 3.89 [3.54–5.37] |

Warm full B is slower (41.55s versus 32.94s); fresh ranges overlap substantially. Tiny differences in cached workloads are not a compelling replacement argument. Search remains hosted Algolia; no local index build was silently removed.

| Workload | A individual / sampled tree MiB | B individual / sampled tree MiB |
|---|---:|---:|
| full | 4507.6 / 5124.0 | 3715.7 / 3867.2 |
| fresh | 4516.3 / 5161.7 | 3876.8 / 4038.9 |
| unchanged | 301.1 / 456.2 | 321.6 / 474.0 |
| body-1 | 301.1 / 454.4 | 319.3 / 477.9 |
| shared-shell | 4512.1 / 5115.5 | 3824.7 / 3979.3 |
| island | 4524.9 / 5135.2 | 3710.2 / 3869.9 |
| route-rename | 303.7 / 458.8 | 321.2 / 483.0 |
| route-delete | 302.8 / 457.9 | 319.1 / 478.5 |

Individual RSS is GNU time maximum process/phase usage, not aggregate memory. Tree RSS is sampled at nominal 50ms, deduplicating owned descendant PIDs; short peaks may be missed, shared mappings can be counted more than once, and neither metric is a dedicated-machine memory guarantee. Raw ranges and samples are retained. B's dominant process is still the Node/Start Rsbuild build, around SSR completion; the approximately 4.4GiB faithful Vite peak falls to approximately 3.6GiB, rather than disappearing into a small publication process. Phase attribution is sampled diagnostic correlation, not an allocator trace.

Warm-full median retained engine time is 27.99s (A) versus 36.14s (B). Complete content stage is 4.26s versus 4.82s; Nift composition within it is 0.84s versus 0.94s. Median component sums need not equal a median total. `component-summary.json` separates discovery/preparation, publisher compilation, assets, composition and output verification; raw phase samples retain finer detail. The conclusion is about retained compiler ownership, not Nift execution speed.

## Correctness and reproduction

Independent frozen runtime installation uses its own dependency directory, not a symlink to an accepted project's dependencies. It passes all 7,527 document/25-root contracts, 333 browser states, required type/lint/unit/chat/desktop suites (one existing desktop skip), 244 static asset byte comparisons, real API/generated/OG/session/search/catalog gates. Adapter dependencies have their own committed frozen lockfile. Full publication, corpus contracts and fresh local Worker gates are recorded separately from performance. Browser/HTTP proofs use controlled local service fixtures, retaining real original handlers; they do not certify private live authenticated services. Accepted upstream and migration trees are not modified by the prototypes. Normal and forced publications are byte-identical across all 24,224 files in this independently installed context. See the final reproduction receipt for gate counts and byte equality.

`prepare-probe.py` creates an isolated Git clone and relocates only the measured sidecar path. Install both frozen dependency trees with the recorded toolchain, provide the retained publisher's sibling Nift binary path, then use the complete publisher. Do not replace the accepted default publisher. Rejected C patch/HTML/authority receipts are preserved for diagnosis, not deployment. Performance label `tanstack-agent` in the raw architecture dataset identifies isolated **B**, while `faithful-agent` identifies **A**; those raw IDs must never become ambiguous recommendation headings.

## Recommendation and stop boundary

Keep A as the conservative default; investigate B only if its measured memory reduction justifies extra Worker/compiler integration and slower warm full builds. Neither provides the proposed transfer of request-time HTML ownership. The technically executable B is a build-engine alternative, not proof of a more compelling Nift-centric application architecture. C fails required freshness or HTML authority, so expansion stops under the user's parity/source-model constraints rather than reimplementing Start or weakening behavior.

For this application, the bounded investigation supports the coupled-boundary outcome (case 3), with a viable but less attractive alternate-engine outcome (case 2). It does not prove all possible island/backend designs impossible. The remaining full-build cost comes from the retained application compiler. Nift's prepared-input publication is independently useful, but this evidence does not justify recommending a complete upstream application migration. If migration effort is removed, retaining the original application architecture remains preferable for both agent-led and mixed maintenance of this full product; among the Nift migrations the authored source remains preferable for a coherent source of truth. A future component-boundary redesign is separate work, not a reason to reopen rejected C inside this pass.
