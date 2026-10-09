import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { runWithHostRuntimeEnv } from '../runtime/src/server/runtime/host.server'
import { fetchRepoFile, fetchRepoRawFile, fetchApiContents } from '../runtime/src/utils/documents.server'
import { fetchPublishedDocumentSource, fetchPublishedDocsMetadata } from '../runtime/src/utils/published-documents.server'
import { parseSiteMarkdown } from '../runtime/src/utils/markdown/processor'
const project = path.resolve('..')
const inventory = JSON.parse(fs.readFileSync(path.join(project,'sources/docs-inputs.json'),'utf8'))
const env={ASSETS:{fetch:async (input: RequestInfo | URL)=>{
 const url = new URL(input instanceof Request?input.url:input.toString())
 const file=path.join(project,'publication/client',url.pathname)
 return fs.existsSync(file)?new Response(fs.readFileSync(file)):new Response(null,{status:404})
}}}
let documents=0
const manifest=JSON.parse(fs.readFileSync(path.join(project,'publication/client/_nift/docs-manifest.txt'),'utf8'))
const testedRoots=new Set<string>()
await runWithHostRuntimeEnv(env,async()=>{
 for(const entry of inventory.files.filter((e)=>e.render)) {
  const key=`${entry.repo}@${entry.ref}:${entry.file}`
  const raw=fs.readFileSync(path.join(project,'publication/client',manifest.files[key]),'utf8')
  const projection=manifest.projections[key]===undefined?undefined:fs.readFileSync(path.join(project,'publication/client',manifest.projections[key]),'utf8')
  const rootKey=`${entry.repo}@${entry.ref}`
  if(!testedRoots.has(rootKey)||documents%100===0) {
    assert.equal(await fetchRepoFile(entry.repo,entry.ref,entry.file),raw)
    assert.equal(await fetchPublishedDocumentSource(entry.repo,entry.ref,entry.file),projection)
    assert.equal(await fetchRepoRawFile(entry.repo,entry.ref,entry.file),fs.readFileSync(path.join(project,'publication/client',manifest.rawFiles[key]),'utf8'))
    testedRoots.add(rootKey)
  }
  assert.ok(typeof raw === 'string',entry.file)
  if(raw === '') {assert.equal(projection,undefined,entry.file);continue}
  assert.ok(projection,entry.file)
  const body=(text: string)=>text.replace(/^---\n[\s\S]*?\n---\n/,'')
  assert.deepEqual(JSON.parse(JSON.stringify(parseSiteMarkdown(body(projection)))),JSON.parse(JSON.stringify(parseSiteMarkdown(body(raw)))),entry.file)
  documents++
 }
 for(const root of inventory.roots) {
  const metadata=await fetchPublishedDocsMetadata(root.repo,root.ref,root.docsRoot)
  assert.ok(metadata)
  const tree=await fetchApiContents(root.repo,root.ref,root.docsRoot)
  assert.ok(tree)
  assert.equal(await fetchRepoFile(root.repo,root.ref,root.docsRoot+'/__deleted-fixture__.md'),null)
  assert.equal(await fetchRepoRawFile(root.repo,root.ref,root.docsRoot+'/__deleted-fixture__.md'),null)
 }
})
console.log(JSON.stringify({documents,roots:inventory.roots.length,ast_semantic_equal:true,owned_deletion_correct:true,raw_render_contracts_distinct:true}))
