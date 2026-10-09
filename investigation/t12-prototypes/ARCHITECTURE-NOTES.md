# T12 architecture investigation — provisional, not benchmark conclusions

The T10 faithful commits remain the conservative baseline. T11 content/cache optimizations are being revalidated; no architecture candidate replaces either baseline yet.

| Retained piece | Browser need | Server need | Build responsibility and candidate boundary |
|---|---|---|---|
| React | Interactive components and hydration | Existing request-time rendering | Retain runtime; dedicated bundler may replace Vite |
| TanStack Router | Routing, loaders, navigation | SSR route matching/data | Retain; generated route tree/compiler integration must remain correct |
| TanStack Query | Query cache and fetching | SSR query integration | Retain; Nift cannot replace runtime query behavior |
| TanStack Table | Interactive tables | Components rendered during SSR | Retain where imported; bundler choice is separate |
| TanStack AI | Chat client/transport | Provider, workflow, API orchestration | Retain; real backend can be separately deployed, not mocked |
| TanStack Start | Client hydration and server-function proxies | Request handlers, server functions, serialization | Official alternate compiler adapter is preferable to rewriting these contracts |
| Vite | None as a runtime library | None as a runtime library | Current bundler/plugin orchestration; test replacement with official Rsbuild adapter |
| Cloudflare Worker | API/service access | Bindings, durable objects, workflows, scheduled handlers | Real service remains; alternative build must preserve exports and binding semantics |
| Tailwind | Generated CSS | CSS included in rendered pages | Standalone compiler can replace Vite plugin, with stylesheet parity checked |
| Redact | React-compatible browser runtime aliases | Existing SSR runtime aliases | Preserve runtime aliases; Vite-only plugin integration needs explicit replacement |
| Content Collections | Generated blog content | Generated blog content | Existing standalone generation command can replace Vite integration |
| Sentry | Runtime error reporting | Runtime error reporting/middleware | Preserve runtime; authenticated upload plugin is not used in the measured environment |
| Devtools/local-docs/local-AI plugins | Development features | Development support | Not production publication work; avoid using removal as a claimed production improvement |
| Bundle analyzer | None | None | Optional diagnostic only |

## A — faithful retained Start/Vite

Existing complete publication, including runtime rebuild when inputs change. Cached unchanged runtime remains valid only after input and artifact checks. Request-dependent shell/session data stays dynamic.

## B — lightweight browser probe

`esbuild-probe/probe.mjs` imports the actual retained router and StartClient without replacing handlers. The plain bundler is rejected: 204 unresolved/unsupported browser graph errors, including server-only filesystem modules. No externals/polyfills/mock server functions were introduced. This is a failed compilation diagnostic, not a successful publication benchmark. It establishes that Start's browser/server transforms cannot simply be skipped.

Next probe: the official Rsbuild adapter shipped in the pinned Start package. This retains the actual framework compiler while testing a replacement build engine. Cloudflare exports, Redact aliases, styles, content generation and browser parity still need proof. Success is not assumed.

## C — separate real backend boundary

A static whole-page snapshot was previously rejected because partner-placement session seeds must remain fresh between requests. Moving the unchanged whole Start SSR worker into a separately named service would not transfer HTML ownership to Nift. A valid split must preserve fresh request behavior and report actual SSR ownership, service build inputs/costs, browser/backend compatibility and complete deployment cost.

No Vite-removal timing or architecture recommendation is accepted yet. No Nift core or production backend changes are authorized by this investigation.

## Observed probe boundaries

The official pinned Start Rsbuild adapter compiled both client and server. Its default Node server output failed in workerd at createRequire(import.meta.url); Worker-targeted output with explicit Node-compatible imports then served real HTML. Seven API/preview modules needed browser-only route identities because exported server-only helpers remained in the browser dependency graph. Original server implementations are unchanged; client import-protection stays fatal. Redact aliases come from the original package map.

Octane's own package documents that its pure browser compiler shares a module graph with an unused Node-only Vite adapter. The probe preserves that unavailable-Node boundary only for Octane, with throwing accessors; any other Node-only browser import still fails. This does not implement Node operations in the browser or replace application handlers.

API status/body contracts, generated output bytes, and fresh per-request session behavior passed for the first executable probe. Dynamic OG failed because the Node/default bundler condition selected Takumi's Vite WASM loader. This candidate is not accepted. The next probe selects the package's actual workerd condition and imports the real compiled WASM module.

Prototype C is implemented as actual Nift raw HTML composition plus a forwarding connection to the real backend. Its session-freshness contract fails: the separately live backend rotates seeds, while the published page freezes its seed. It is explicitly rejected and ineligible for benchmark comparison. This does not prove every conceivable split impossible; it proves the simple maintained whole-page split loses required behavior. Recreating Start's request-specific HTML/loader serialization machinery is outside the authorized bounded approach.

Official adapter guidance: https://www.rsbuild.dev/guide/migration/tanstack-start. Build-engine replacement does not transfer request-time HTML/SSR ownership to Nift; that distinction must remain visible.

## Corrected complete-publication gates

The isolated agent clone completes the entire publication with both Rsbuild browser/server environments, Nift composition, assets and Worker configuration. Configuration derives from maintained wrangler.jsonc through a pinned JSONC parser. Takumi uses its original supplied workerd loader and actual compiled WASM import; the dynamic PNG is byte-identical to the reference. The first executable engine variant passed all 333 semantic browser states; the corrected complete clone additionally passes the original API/generated/session/interaction/search/catalog gates, including mobile menu and client-side navigation. A new computed-style/layout gate compares body/main/heading at 1440/768/390 widths; it passes. The clone reuses the frozen original installed runtime dependency tree for the prototype and has a separately locked adapter toolchain. This is not yet an independent fresh-install reproduction.

The architecture campaign measures five samples for full, fresh, unchanged, one-document body edit, shared shell, browser component, rename and delete in two valid agent variants. Its clock includes any required browser AND backend compilation. Individual GNU time RSS and sampled PID-deduplicated descendant-tree RSS are retained; approximate phase/process attribution is additional diagnostic data. No rejected static/probe build is given a misleading successful publication time. Shared-machine load remains recorded. Source mutation/restoration and lifecycle retirement rules are reused from the faithful campaign.

## Scoped article boundary — implemented and rejected as an HTML authority

A second C prototype changes four application files (not TanStack libraries or Nift): a validated optional maintained HTML field, initial server article injection inside the existing feedback container, then the original React Markdown components after browser mounting. It preserves the dynamic shell, original Query/Router/feedback code, and heading observer rebinding. Three real pages cover ordinary content, a comparison table, and Start tabs/code; twelve viewport/implementation states plus mobile menu and tab interactions match the faithful renderer. This is a bounded three-page/React proof, not a full-corpus HTML migration.

The decisive HTML-only source edit is published correctly by a normal Nift command with the unchanged backend bundle reused. It is visible inside the real server-rendered article, with JavaScript disabled. After browser mounting, it disappears without a page error because the retained original components render the unchanged AST. The authority receipt therefore rejects the bridge as a single maintained-HTML model. Keeping synchronized HTML plus a full shadow AST is possible but adds coordination; eliminating that shadow requires a different component/island design. No broad reimplementation or corpus scaling follows this failed source-of-truth gate. C timing is not eligible as an accepted migration benchmark.
