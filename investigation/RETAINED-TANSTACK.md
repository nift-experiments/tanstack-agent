# Replacement / retention / coexistence map — T2 boundary

Pinned upstream: `862ccc3d191818320c3e6d217542883f80cb907a`. T1 baseline is accepted. This is the source-derived replacement boundary; implementation and parity remain gated by T3/T7. Nift + retained TanStack is the experiment; no subsystem is removed merely to reduce dependencies.

| Subsystem | Classification | Pinned-source evidence | Boundary / benchmark treatment |
| --- | --- | --- | --- |
| Public marketing and documentation publication | Nift should replace | `src/routes/index.tsx`, `src/routes/_library/$libraryId/$version.docs.$.tsx` | Candidate offline publication of cacheable surfaces; prove original loader state, metadata, hydration and navigation before scaling. |
| Authored blog collection | Nift can coexist with it | `content-collections.ts`, `src/blog/`, `scripts/build-content-collections.mjs` | Preserve authored Markdown/frontmatter and schemas in authored model. Rendered model maintains HTML plus explicit metadata. Derivation costs remain timed. |
| React component rendering / hydration | should remain TanStack/React | `src/routes/__root.tsx`, `src/components/Doc.tsx` | Preserve shared providers, client state and interactive components. No framework-free requirement. |
| TanStack Redact SSR compatibility | Nift can coexist with it | `vite.config.ts` server aliases and `redact()` | Default upstream renderer differs from stock React DOM server; retain selected upstream semantics in authored compatibility stages until a proof says otherwise. |
| TanStack Router | should remain TanStack/React | `src/router.tsx`, `src/routeTree.gen.ts` | Keep typed routes, loaders, client navigation, preload, scroll restoration, pending/error/404 states and search parameters. |
| TanStack Query + SSR integration | should remain TanStack/React | `src/router.tsx`, `src/queries/`, `src/routes/index.tsx` | Preserve request-scoped QueryClient, hydration and data-backed UI. Static output must not freeze user-specific state. |
| TanStack Start server functions | should remain backend/service | `src/start.ts`, `src/utils/*.functions.ts` | Preserve callable functions, CSRF and transports; Nift does not impersonate this protocol. Include retained runtime build costs when rebuilding them is required. |
| API / server routes | should remain backend/service | `src/routes/api/`, `src/routes/oauth/` | Keep real endpoints and method/status/headers contracts. Local deterministic fixtures are test-only. |
| Cloudflare Worker request entry | should remain backend/service | `src/server.ts`, `wrangler.jsonc` | Preserve security/embed/cache/content-negotiation headers and routing to retained application surfaces. Candidate static asset precedence must be proved. No infrastructure deployment in publication timings. |
| PostgreSQL / Drizzle / Hyperdrive | should remain backend/service | `src/db/client.ts`, `src/db/schema.ts`, `drizzle/`, `wrangler.jsonc` | Retain storage and transactions. Never connect to production. Disposable local database/transport fixtures may verify contracts; not live integration. |
| OAuth / sessions / accounts | should remain backend/service | `src/utils/auth.server.ts`, `src/routes/auth/`, `src/routes/api/auth/` | Retain production auth. No auth-login workflow, production cookies or OAuth mutation. Logged-out/unconfigured and deterministic local contracts are separate evidence. |
| Chat / AI / builder / MCP / workflows | should remain backend/service | `src/chat/`, `src/mcp/`, `src/server.ts`, `wrangler.jsonc` | Keep services, streaming, Durable Objects, Workflows and model execution. Retain React application UI. No paid model invocation or production state writes. |
| Builder / editors / demos / charts | should remain TanStack/React | `src/components/application-starter/`, `src/routes/_library/charts.catalog.collections.$collectionId.tsx` | Preserve component code and actual runtime behavior, including worker/WebContainer execution boundaries. |
| Browser and Worker bundling | Nift can coexist with it | `vite.config.ts`, `package.json` | Vite builds retained runtime independently. Complete publication measures required client/Worker bundle steps, not bare Nift. |
| Tailwind / CSS | Nift can coexist with it | `vite.config.ts`, `src/styles/app.css` | Retain established styling output and theme tokens; do not redesign or remove CSS compilation when inputs change. |
| Static assets | Nift should replace | `public/` | Ordinary publication ownership/copying/hashing as necessary. All required bytes retained; no recurring generation of maintained assets merely for compatibility. |
| Generated brand/icons/chart assets | requires further investigation | `scripts/generate-brand-assets.mjs`, `scripts/generate-phosphor-icon-registry.mjs`, `scripts/generate-charts-landing-svg.ts` | Determine maintained-vs-regenerated ownership from actual pipeline; preserve bytes and explicit update workflows. |
| OG image service | should remain backend/service | `src/server/og/`, `src/routes/api/` | Dynamic image response service remains separate from static asset publication. Do not silently materialize every possible request as fixed assets. |
| Remote documentation ingestion / versions | Nift can coexist with it | `src/libraries/libraries.ts`, `src/utils/documents.server.ts`, `src/utils/docs.functions.ts` | Capture exact external repository refs/trees/menu/body inputs. Authored model keeps source authoritative; rendered model explicitly maintains derived HTML. Runtime fallback/version routes remain when needed. |
| Docs webhooks / cache maintenance | should remain backend/service | `scripts/sync-docs-webhooks.ts`, `src/utils/github-content-cache.server.ts` | Preserve service responsibility. Never run webhook synchronization or mutate production R2. Explicit pinned refresh may supply Nift publication inputs. |
| Search (hosted Algolia) | Nift can coexist with it | `src/components/SearchShared.tsx`, `src/components/SearchModal.tsx` | Retain hosted search transport and filters. Test with deterministic responses; no false live-index integration claim. No invented local search generation stage. |
| Metadata / redirects / Markdown negotiation / sitemap / LLM routes | Nift can coexist with it | `src/utils/seo.ts`, `src/utils/sitemap.ts`, `src/routes/sitemap[.]xml.ts`, `src/routes/llms[.]txt.ts`, `src/server.ts` | Static derivations are candidates; preserve dynamic corpus/catalog dependencies and exact status/header negotiation behavior. |
| Shopify / uploads / notifications / analytics / error reporting | should remain backend/service | `src/server/shopify/`, `src/server/uploadthing.ts`, `src/utils/email.server.ts`, `src/router.tsx`, `src/server.ts` | Retain real service boundaries. Stub/block outbound transports in tests; never send mail, feedback, analytics or Sentry events. |
| Deployment/database migration/cache purge | should remain backend/service | `package.json` deploy scripts, `wrangler.jsonc` | Infrastructure work explicitly outside public-site publication benchmark. Never execute deploy/db-migrate/cache-purge against production. |
| Desktop application / releases | should remain TanStack/React | `desktop/`, `package.json` desktop scripts | Part of upstream repository inventory; retained adjacent application, not website publication. No desktop release/publish operations. |

## Source-model distinction

- **Nift `tanstack` (authored-source)**: Markdown/frontmatter/structured sources remain authoritative; existing React/TanStack implementations retained where useful. Compatibility/collection/rendering and required bundling costs remain in the complete publication pipeline.
- **Nift `tanstack-agent` (rendered-source)**: maintained HTML and explicit metadata/projections where appropriate, retaining useful runtime components/services. Ordinary HTML is maintained directly where suitable; pre-derived React/TanStack document projections may be maintained for component-heavy content. Dynamic content transformations remain only where the retained runtime actually needs them. Explicit refresh/update work is distinguished from normal publication.

## Evidence boundaries

UI parity, local transport parity and actual live backend integration are separate. Neither a compiled Worker nor a deterministic fixture establishes live service integration. A route pattern is not a concrete publication page. The complete documentation corpus and dynamic route contracts must be reconciled before performance claims.

## Publication boundary selected for T3

Nift composes cacheable public documents and publishes maintained assets. Vite remains responsible for the existing React/TanStack browser and Cloudflare Worker bundles. The Worker keeps its original dynamic routes/services and selects published documents only through an explicit public-route manifest. Requests with authentication/session cookies, authorization, non-GET methods, unrecognized query parameters or unsupported negotiation bypass the static document path. Security/content-negotiation headers remain Worker-owned. No static mock replaces a production server function.

Published HTML must retain the original hydration payload, asset graph and router state. A raw Nift dependency/composition test will prove literal syntax survives; content edits must survive initial hydration and client navigation. The rendered model may maintain a TanStack document AST for rich components rather than replacing tabs, framework filtering, live examples or code controls with inert HTML. The authored model derives the same projection from maintained Markdown. Exceptions such as partner-dependent Start hosting content stay explicitly runtime-rendered. This is a bounded migration adapter, not a replacement Router/Query/Start implementation.

## Benchmark comparability rule

Upstream docs are runtime inputs. A docs body edit does **not** inherently require a Vite rebuild. Report upstream production rebuild scenarios separately from docs-cache/ingestion refresh scenarios. Compare complete Nift publication (including all required derivation, SSR, bundling and composition) with the corresponding upstream publication/update workflow, and expose the cost of prepublishing documents that upstream renders on demand. Never force an unnecessary upstream build or remove a required migration step. Backend infrastructure deployment remains outside both workflows.

## Remaining proof obligations

- Public cached documents contain no private/user-specific state; logged-in requests reach retained runtime.
- Maintained rendered content remains authoritative after hydration and navigation.
- Published input revisions are used by retained loaders, downloads and generated projections consistently.
- Static asset requests preserve Cloudflare precedence; API/server functions remain callable.
- Changed input dependencies invalidate exactly the necessary publication families, and add/rename/delete remove stale output.
- Search remains hosted Algolia with deterministic transport fixtures; no build-time index is invented.
