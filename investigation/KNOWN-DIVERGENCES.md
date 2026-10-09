# KNOWN-DIVERGENCES.md

Every difference from the frozen reference must be recorded and classified.
Distinguish inherited upstream behaviour from a migration regression.

| ID | Route/component | Observed behaviour | Classification | Evidence | Approval/rationale | Resolution |
| --- | --- | --- | --- | --- | --- | --- |

Classification: inherited upstream / intentional migration difference /
unresolved / blocking.

A migration is not complete while any entry is unresolved or blocking.

| T3-001 | Shared shell / partner placement | Whole-page prototype reused one session seed | Blocking prototype defect, resolved by rejecting architecture | `t3-rejected-whole-page-composition.json`; upstream `src/routes/__root.tsx` | Preserve session-level partner rotation | TanStack request-time shell retained; whole-page cache adapter removed |

The prototype is not an accepted production route. Its byte-preserving composition evidence remains useful, but no performance/parity claim relies on frozen whole-page output.

| T10-001 | Documentation source/publication | Nift owns frozen local corpus projections, while upstream ingests remote docs at runtime | Intentional migration difference | T10-PROTOCOL.md, REPORT.md | Explicit source/publication model; acquisition outside timing | Native upstream updates and Nift publication are labeled separately |
| T10-002 | Agent maintained source | AST plus original/download text may use more bytes and require coordinated edits | Intentional source-model difference | sources/docs-inputs.json, REPORT.md | Preserve useful rich React rendering | No all-HTML/Markdown-free claim; source-model preference evaluates this cost |

No unresolved or blocking production parity defect remains within the accepted local contract. Unverified live providers/deployment and full accessibility/other-engine certification are explicit scope limits, not claimed passes.
