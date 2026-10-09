import assert from 'node:assert/strict'
import { runWithHostRuntimeEnv } from '../runtime/src/server/runtime/host.server'
import { fetchPublishedRepoFile, fetchPublishedDocumentSource } from '../runtime/src/utils/published-documents.server'
const key = 'tanstack/query@main:docs/overview.md'
const raw = '---\ntitle: Overview\n---\n# Hello\n\n'
const projection = 'projection only'
const assets = new Map([
  ['/_nift/docs-manifest.txt', JSON.stringify({files:{[key]:'/_nift/docs/raw.txt'},projections:{[key]:'/_nift/docs/render.txt'},roots:['tanstack/query@main:docs/']})],
  ['/_nift/docs/raw.txt', raw], ['/_nift/docs/render.txt', projection],
])
const env = {ASSETS:{fetch:async (input: RequestInfo | URL) => {
  const pathname = new URL(input instanceof Request ? input.url : input.toString()).pathname
  const body = assets.get(pathname)
  return new Response(body, {status:body === undefined ? 404 : 200})
}}}
await runWithHostRuntimeEnv(env, async () => {
  assert.equal(await fetchPublishedRepoFile('TanStack/query','main','docs/overview.md'),raw)
  assert.equal(await fetchPublishedDocumentSource('tanstack/query','main','docs/overview.md'),projection)
  assert.equal(await fetchPublishedRepoFile('tanstack/query','main','docs/deleted.md'),null)
  assert.equal(await fetchPublishedRepoFile('tanstack/query','main','examples/example.ts'),undefined)
  assert.equal(await fetchPublishedRepoFile('tanstack/query','v4','docs/overview.md'),undefined)
  assets.delete('/_nift/docs/raw.txt')
  assert.equal(await fetchPublishedRepoFile('tanstack/query','main','docs/overview.md'),null)
  assets.set('/_nift/docs-manifest.txt', JSON.stringify({[key]:'/_nift/docs/render.txt'}))
  assert.equal(await fetchPublishedRepoFile('tanstack/query','main','docs/overview.md'),undefined)
  assert.equal(await fetchPublishedDocumentSource('tanstack/query','main','docs/overview.md'),projection)
})
assert.equal(await fetchPublishedRepoFile('tanstack/query','main','docs/overview.md'),undefined)
console.log('Raw bytes, render projections, deletion ownership, external fallback, and T3 compatibility passed.')
