import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { runWithHostRuntimeEnv } from '../runtime/src/server/runtime/host.server'
import { getCachedGitHubTextFile, getCachedDocsArtifact, markGitHubContentStale, markDocsArtifactsStale, resetGitHubContentCacheForTest } from '../runtime/src/utils/github-content-cache.server'
const {Miniflare,convertV4MiniflareOptions}=await import('../runtime/node_modules/miniflare/dist/src/index.js')
const worker=new Miniflare(convertV4MiniflareOptions({name:'local-storage-fixture',modules:true,script:'export default {fetch(){return new Response("local storage fixture")}}',compatibilityDate:'2026-06-19',r2Buckets:['GITHUB_CONTENT_CACHE'],outboundService:()=>new Response('External transport blocked',{status:503})}))
try {
 const bucket=await worker.getR2Bucket('GITHUB_CONTENT_CACHE')
 // Materialize the Node RPC body once, then preserve ordinary single-use Response semantics.
 // Reading the proxy's body property directly transfers it before text() can consume it.
 const localBucket={
  delete:(keys:string|string[])=>bucket.delete(keys),
  list:(options)=>bucket.list(options),
  put:(key,value,options)=>bucket.put(key,value,options),
  get:async(key:string)=>{
   const object=await bucket.get(key)
   if(!object)return null
   const response=new Response(await object.arrayBuffer())
   return {key:object.key,etag:object.etag,customMetadata:object.customMetadata,uploaded:object.uploaded,body:response.body,text:()=>response.text(),arrayBuffer:()=>response.arrayBuffer()}
  },
 }
 const original=fs.readFileSync(path.resolve('../sources/docs-inputs.json'),'utf8')
 const sourceModel=JSON.parse(fs.readFileSync(path.resolve('../investigation/init-guidance.json'),'utf8')).source_model
 resetGitHubContentCacheForTest()
 await runWithHostRuntimeEnv({GITHUB_CONTENT_CACHE:localBucket},async()=>{
  let calls=0;let body='public fixture revision 1'
  const options={repo:'tanstack/query',gitRef:'main',path:'examples/local-contract.md',origin:async()=>{calls++;return body}}
  assert.equal(await getCachedGitHubTextFile(options),body)
  assert.equal(await getCachedGitHubTextFile(options),body)
  assert.equal(calls,1)
  assert.ok((await bucket.list()).objects.length>0)
  body='public fixture revision 2'
  assert.equal(await markGitHubContentStale({repo:'tanstack/query',gitRef:'main'}),1)
  assert.equal(await getCachedGitHubTextFile(options),body)
  assert.equal(calls,2)
  let builds=0
  const artifact={repo:'tanstack/query',gitRef:'main',docsRoot:'examples',artifactType:'docs-path-manifest',artifactKey:'fixture',isValue:(value:unknown):value is string[]=>Array.isArray(value)&&value.every(x=>typeof x==='string'),build:async()=>{builds++;return ['examples/contract']}}
  assert.deepEqual(await getCachedDocsArtifact(artifact),['examples/contract'])
  assert.deepEqual(await getCachedDocsArtifact(artifact),['examples/contract'])
  assert.equal(builds,1)
  assert.equal(await markDocsArtifactsStale({repo:'tanstack/query',gitRef:'main'}),1)
  assert.deepEqual(await getCachedDocsArtifact(artifact),['examples/contract'])
  assert.equal(builds,2)
  console.log(JSON.stringify({sourceModel,real_local_R2:true,node_rpc_body_bridge:true,cache_hit:true,explicit_invalidation:true,artifact_refresh:true,local_objects:(await bucket.list()).objects.length,production_mutations:false}))
 })
 assert.equal(fs.readFileSync(path.resolve('../sources/docs-inputs.json'),'utf8'),original)
}finally{resetGitHubContentCacheForTest();await worker.dispose()}
