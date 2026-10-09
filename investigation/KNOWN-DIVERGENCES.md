# KNOWN-DIVERGENCES.md

Every difference from the frozen reference must be recorded and classified.
Distinguish inherited upstream behaviour from a migration regression.

| ID | Route/component | Observed behaviour | Classification | Evidence | Approval/rationale | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

Classification: inherited upstream / intentional migration difference /
unresolved / blocking.

A migration is not complete while any entry is unresolved or blocking.

| T3-001 | Shared shell / partner placement | Whole-page prototype reused one session seed | Blocking prototype defect, resolved by rejecting architecture | `t3-rejected-whole-page-composition.json`; upstream `src/routes/__root.tsx` | Preserve session-level partner rotation | TanStack request-time shell retained; whole-page cache adapter removed |

The prototype is not an accepted production route. Its byte-preserving composition evidence remains useful, but no performance/parity claim relies on frozen whole-page output.
