# Future investigation candidates

These candidates are separate from the accepted migration experiment. They do not authorize Nift core changes, upstream modifications or new backend integration work.

- Retained Vite/Start bundling dominates complete full-publication time and memory. Evaluate incremental production bundle reuse and process architecture at that boundary rather than attributing its cost to bare Nift composition.
- The production publisher still scans the runtime and full document inventory, decodes maintained projections, prepares metadata and synchronizes retained assets on ordinary commands. Profile narrower content/metadata invalidation and compiled publication utilities.
- Agent-maintained AST, original source and Markdown-download projections require coordinated edits. Include cross-framework reference coordination as well as per-page fields. Consider an explicit maintenance tool/schema that validates their relationship without quietly restoring routine Markdown derivation.
- Serialized projection envelopes carry more data than a Markdown-only input, including maintenance information in the agent model. Measure browser/network/bootstrap costs and evaluate a smaller runtime projection separately from maintained source.
- The global publication manifest is about 4 MB. Verified revision caching avoids repeated parsing; per-repository manifests or lookup indexes may reduce cold-read/heap cost further.
- Original missing-path redirect metadata and cold generated-output requests can scan large documentation sets. Evaluate narrower invalidation, eagerly maintained redirect indexes or a scoped prepublication artifact job without weakening valid-path freshness.
- Separately measure retained request-time rendering, cold/warm manifest reads and browser/bootstrap payload cost. Native-update versus pre-derived-publication timings do not establish end-user request performance.
- Hosted Algolia crawling/index freshness and ranking are external to the local fixture proof. A separately authorized evaluation could verify them against an owned index.
- Live tenant deployment, auth/database/storage/workflow integrations require owned resources and an authorized integration campaign. The original code is retained, but this experiment does not certify those live systems.
- Carry the concrete partial-stack, native-update, external-input and revision lessons in MIGRATION-INIT-REVIEW.md into later Nift guidance work.

Preserve parity, keep upstream advantages and remaining costs visible, and evaluate changes against complete workflows. The additional performance investigation is now authorized; keep later core/tooling ideas distinct from migration-side changes.
