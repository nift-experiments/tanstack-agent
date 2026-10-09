# T4 corpus publication boundary

The corpus contains 7,601 captured input files across 24 pinned repository/ref pairs and 25 docs roots: 7,530 `.md`, 18 `.mdx`, and 53 other files. There are 199 frontmatter-ref source files. Counts are inputs, not concrete HTML routes.

Both publications preserve every original input SHA256. The retained upstream resolver handles refs, section overrides and branch-relative images through an injected maintained-file reader. Its behavior is reused, including its existing section warnings; no alternate Markdown dialect is invented.

## Three distinct content contracts

- `fetchRepoRawFile`: original input bytes, including ordinary binary/config assets.
- `fetchRepoFile`: resolved Markdown with the same ref/section/image processing as upstream; consumers such as changelogs and Markdown downloads do not receive a document envelope.
- `fetchDocs`: pre-derived TanStack document projection, rendered through the existing React components and request-dependent shell.

The authored project maintains Markdown/frontmatter in the original organization under `sources/docs/<repo--ref>/<upstream path>`. Normal publication resolves it and derives a transient document projection.

The agent project maintains the pre-derived document envelope with explicit resolved-download and original-raw projections. This intentionally entails coordination when editing those projections. Ordinary corpus publication does not derive these documents from Markdown. Useful React/application sources remain retained.

There are 7,527 non-empty pre-derived documents. One empty Markdown input retains upstream's not-found behavior. Two Start hosting guides stay raw because their content depends on rotating partners at request time. The 18 MDX inputs remain raw where the upstream docs selector does not select them. The original 80 blog content-collection sources and their small Vite collection step remain useful retained authored components; this is a hybrid/pre-derived model, not an assertion that every source is HTML or that all runtime Markdown parsing is eliminated.

## Ownership and incremental behavior

Nift composes document envelopes, docs trees, path/redirect metadata and an explicit manifest through the proven raw dependency template. Raw inputs/downloads are copied without text normalization. Names follow the original paths rather than numerical input positions.

Owned missing files return missing rather than falling back to GitHub. Directory ownership is bounded to declared docs roots; example workspaces and other repository paths retain upstream behavior. Owned path/redirect metadata bypasses stale runtime metadata caches. The publisher removes stale owned assets and generated wrappers after rename/delete.

The initial authored implementation resolves the entire corpus before deriving changed projections. This preserves transitive ref correctness but has a fixed cost to profile. Nift's explicit dependencies point to the resulting projection/metadata files. No Nift core changes or native `@markup` performance claims are involved.

## Complete publication

```sh
python3 scripts/run-runtime.py node ../scripts/publish.mjs --full
python3 scripts/run-runtime.py node ../scripts/publish.mjs
```

The complete command includes retained Vite/browser/Worker bundling when required, clean retained asset synchronization, compatibility/projection work, metadata preparation and Nift composition. Runtime source fingerprints avoid rebundling for docs-only edits. Component and total timings are recorded separately in ignored `.rendered/` receipts. These T4 runs are smoke measurements, not the final benchmark campaign.

`publication/client` is the browser/asset publication; `publication/server` is the retained Worker. Local proof Workers consume this publication. Wrangler's generated account/resource configuration remains upstream provenance and is not authorization to deploy to upstream infrastructure. No deployment or infrastructure mutation has been performed. Local commands isolate Wrangler configuration and disable metrics.

Hosted Algolia, dynamic OG services and all backend implementations remain retained. Search has no local publication-time index generation; fixture checks establish UI/transport contracts, not hosted ranking/index freshness. Live backend integration remains unverified.

T3 representative scripts/receipts are historical proofs; use the complete T4 publisher for current production output. Large logs, snapshots and screenshots stay outside these source trees and outside Labs.
