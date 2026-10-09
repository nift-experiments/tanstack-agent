import assert from 'node:assert/strict'
import {runWithHostRuntimeEnv} from '../runtime/src/server/runtime/host.server'
import {fetchPublishedRepoFile} from '../runtime/src/utils/published-documents.server'
let revision='a'.repeat(64);let manifestReads=0;let body='revision A'
const assets={fetch:async(input:RequestInfo|URL)=>{
 const url=new URL(input instanceof Request?input.url:String(input))
 if(url.pathname==='/_nift/docs-manifest.txt'){manifestReads++;return Response.json({revision,files:{'tanstack/query@main:docs/contract.md':'/_nift/docs/raw/contract.txt'},roots:['tanstack/query@main:docs/']})}
 return new Response(body)
}}
async function read(env:Record<string,unknown>){return runWithHostRuntimeEnv(env,()=>fetchPublishedRepoFile('tanstack/query','main','docs/contract.md'))}
assert.equal(await read({ASSETS:assets,NIFT_PUBLICATION_REVISION:revision}),body)
assert.equal(await read({ASSETS:assets,NIFT_PUBLICATION_REVISION:revision}),body)
assert.equal(manifestReads,1)
revision='b'.repeat(64);body='revision B'
assert.equal(await read({ASSETS:assets,NIFT_PUBLICATION_REVISION:revision}),body)
assert.equal(manifestReads,2)
await read({ASSETS:assets});await read({ASSETS:assets});assert.equal(manifestReads,4)
await assert.rejects(()=>read({ASSETS:assets,NIFT_PUBLICATION_REVISION:'c'.repeat(64)}),/revision does not match/)
revision='c'.repeat(64);body='revision C'
assert.equal(await read({ASSETS:assets,NIFT_PUBLICATION_REVISION:revision}),body)
console.log(JSON.stringify({immutable_revision_cache:true,revision_transition_refreshes:true,missing_revision_uncached:true,mismatch_rejected:true,failed_read_recovers:true}))
