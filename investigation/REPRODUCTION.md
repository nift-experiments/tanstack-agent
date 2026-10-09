# Reproduction

The complete publisher needs the maintained source tree, its original lockfile, Python 3, Node 25.9.0, pnpm 11.1.0 and Nift 4.9.0. Local browser/runtime proof additionally needs the frozen public transport/browser fixtures and an original pinned upstream build. Infrastructure deployment, production credentials and live private provider access are not required or certified.

## Toolchain and complete build

Use sibling layout `tanstack`, `tanstack-agent`, `tanstack-baseline`. The publisher invokes `tanstack-baseline/toolchain/nift-v4.9.0` explicitly. Put Node under `toolchain/node-v25.9.0-linux-x64`, pnpm under `toolchain/pnpm/node_modules/.bin`, and an empty npm configuration at `toolchain/empty-npmrc`. `run-runtime.py` isolates configuration and disables Wrangler metrics. A Linux x86_64 toolchain was measured; other platforms must record their own results.

Node's official archive is `https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-x64.tar.xz`; accepted archive SHA-256 is `1d8db7d6e291d167e8c467ae4094be175e1a0b3969c7ae1f8955b9f7824f7b2e`. Install pnpm 11.1.0 into the owned toolchain, not globally. Provision a Nift 4.9.0 binary in the explicit path above. Accepted binary hashes are in `../evidence/t10/environment.json`; they identify the measured binaries, not a promise that independently compiled binaries will be identical. Do not change Nift core to run this project.

From either repository:

```sh
python3 scripts/run-runtime.py pnpm install --frozen-lockfile
python3 scripts/run-runtime.py node ../scripts/publish.mjs --full
python3 scripts/run-runtime.py node --import tsx ../scripts/corpus-contract.mts
python3 scripts/run-runtime.py node ../scripts/publish.mjs
```

Dependency acquisition is outside benchmark timing. Fresh clones and installed-dependency publication checks are recorded in `../evidence/t10/closeout.json`. Output is `publication/client` and `publication/server`; do not run the upstream deployment/database scripts against real accounts. A publication directory alone does not provision Cloudflare resources.

## Frozen fixture setup

Canonical local fixture bytes are committed once under the authored repository's `evidence/fixtures`: original recursive Git trees, captured public blog feed and frozen CDN modules. Both migrations use those same fixtures. Original docs are already maintained byte-for-byte in authored `sources/docs`. Catalog example data comes from the immutable Charts commit and verified Git blobs; acquisition remains outside timing.

Create a new owned baseline directory rather than overwriting accepted evidence:

```sh
python3 tanstack/scripts/baseline/provision-fixtures.py \
  --baseline /absolute/path/to/tanstack-baseline \
  --authored-source /absolute/path/to/tanstack
```

This verifies all committed hashes, copies inputs independently (no mutable source symlinks), and fetches only the public pinned Charts archive when needed. It refuses to replace an existing different fixture. The captured public blog data is a test input, not an upstream database/API integration claim.

Clone `TanStack/tanstack.com` into the new baseline's `build-work`, checkout detached `862ccc3d191818320c3e6d217542883f80cb907a`, preserve its lockfile, then install/build with the committed isolated runner copied to the baseline. Set `TANSTACK_BASELINE_DIR` to that absolute baseline path when invoking the copied runner; its source-tree default is not valid after relocation. Copy `build-work/dist` to `reference-production-build1` once and keep that reference immutable. Do not use a migration output on both sides of parity comparison. Original reference outputs are 1,867 build files; migration publications additionally include owned documentation input/projection artifacts.

Install Playwright 1.63.0 in owned `toolchain/browser`. Use explicit Chromium revision 1234 / Chrome for Testing 151.0.7922.34; accepted proof initially borrowed that installed browser, and closeout copied the identical bytes into the owned toolchain and reran proof. Browser scripts accept `TANSTACK_CHROMIUM` or default to the owned `toolchain/chromium-1234/chrome-linux64/chrome`. The official archive URL is recorded in ../evidence/t10/owned-browser.json. Its binary SHA-256 is `0b20b130e7edd9dd51873be867761295fe0cfad490c2b9a64f95bd3cfc08fa71`. Playwright 1.63.0's default browser revision differs: do not silently substitute it into the recorded proof. New engine/version checks require their own provenance.

## Local proof

Set `TANSTACK_BASELINE_DIR` to the owned baseline for proof output. Supply the owned toolchain through `TANSTACK_TOOLCHAIN` if it differs. From authored retained runtime, start the original local Worker with `node ../scripts/baseline/runtime-server.mjs` through `run-runtime.py`; start the migration Workers with `node ../scripts/proof-server.mjs 4022` and `4023` through each respective runner. Wait for ready messages before running contracts. All use captured GET fixtures and local test secrets; outbound writes/private transports are blocked.

```sh
python3 scripts/run-runtime.py node ../scripts/corpus-browser.mjs --expanded
python3 scripts/run-runtime.py node ../scripts/catalog-runtime-contract.mjs --offline
python3 scripts/run-runtime.py node ../scripts/search-contract.mjs
python3 scripts/run-runtime.py node --import tsx ../scripts/runtime-storage-contract.mts
python3 scripts/run-runtime.py node --import tsx ../scripts/publication-revision-contract.mts
```

Additional generated/API/OG/session/lifecycle and required suite commands/receipts are preserved in the T3–T9 scripts and `../evidence/t9/validation-summary.json`. Proof outputs belong in the external baseline, not Labs. Stop local Workers after proof. Historical `proof-compose.mjs` is a T3 prototype tool; do not run it over the accepted complete-corpus publication.

## Benchmark

`final-campaign.py` defines exact controlled inputs and reversible external journals. Run it only in an owned prepared sibling workspace with clean source trees and no competing task-owned proof/build servers. It measures five serialized samples for each of 15 workloads and three implementations. It resumes completed keys; move old campaign outputs aside to run a genuinely new campaign. Controlled files, navigation entries and source registries are restored, with collision checks against concurrent changes.

The final campaign preserves the original full/fresh cohort, the corrected native-input-plan cohort and the later lifecycle-isolation tool identity; `campaign-cohorts.json` preserves both tool identities. The original full/fresh production code and commands were unaffected by the correction. `T10-PROTOCOL.md` specifies cache states, native valid/missing-path branches, production bundle cases, timing windows, RSS metrics and exclusions. Reproduction on a different machine is a new measurement, not a promise of these exact seconds.

Production artifact configuration uses publication/server/wrangler.json: its main entry is index.js and its ASSETS directory is ../client. Consume both output folders and the generated matching NIFT_PUBLICATION_REVISION as one publication version. The original runtime deploy shortcut is not a migration deployment recipe; provision/validate owned services and tenant limits separately before any authorized live deployment.
