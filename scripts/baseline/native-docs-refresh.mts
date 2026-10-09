// Benchmark the pinned upstream native cache/ingestion path, not a Vite rebuild.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
const baseline=process.env.TANSTACK_BASELINE_DIR||path.resolve('..')
const upstream=path.join(baseline,'build-work')
const load=(file:string)=>import(pathToFileURL(path.join(upstream,file)).href)
const {runWithHostRuntimeEnv}=await load('src/server/runtime/host.server.ts')
const {fetchRepoFile,fetchApiContents}=await load('src/utils/documents.server.ts')
const {collectRedirectEntriesForFile,buildDocsManifest,buildDocsPathManifest,isDocsManifest}=await load('src/utils/docs.functions.ts')
const {buildRedirectManifest}=await load('src/utils/redirects.ts')
const {getCachedDocsArtifact,markGitHubContentStale,markDocsArtifactsStale}=await load('src/utils/github-content-cache.server.ts')
const {fixtureOutbound,fixtureCalls}=await import(pathToFileURL(path.join(baseline,'fixture-provider.mjs')).href)
globalThis.fetch=async(input,init)=>fixtureOutbound(new Request(input,init))
const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(path.join(upstream,'node_modules/miniflare/dist/src/index.js')).href)
const cache=process.argv[2];const mode=process.argv[3]||'refresh';const count=Number(process.argv[4]||1)
assert.ok(cache,'Pass an owned local cache directory')
const worker=new Miniflare(convertV4MiniflareOptions({name:'native-docs-refresh',modules:true,script:'export default {fetch(){return new Response("fixture")}}',compatibilityDate:'2026-06-19',r2Buckets:['GITHUB_CONTENT_CACHE'],r2Persist:cache,outboundService:()=>new Response('External transport blocked',{status:503})}))
try{
const bucket=await worker.getR2Bucket('GITHUB_CONTENT_CACHE')
const localBucket={delete:(keys)=>bucket.delete(keys),list:(options)=>bucket.list(options),put:(key,value,options)=>bucket.put(key,value,options),get:async(key)=>{const object=await bucket.get(key);if(!object)return null;const response=new Response(await object.arrayBuffer());return{key:object.key,etag:object.etag,customMetadata:object.customMetadata,uploaded:object.uploaded,body:response.body,text:()=>response.text(),arrayBuffer:()=>response.arrayBuffer()}}}
const inventory=JSON.parse(fs.readFileSync(path.join(baseline,'../tanstack/sources/docs-inputs.json'),'utf8'))
const selected=inventory.files.filter(e=>e.repo==='tanstack/query'&&e.ref==='main'&&e.file.endsWith('.md')&&!e.file.includes('/reference/')&&fs.existsSync(path.join(baseline,'external-inputs/docs/tanstack--query--main',e.file))&&fs.statSync(path.join(baseline,'external-inputs/docs/tanstack--query--main',e.file)).size>0).slice(0,count)
await runWithHostRuntimeEnv({GITHUB_CONTENT_CACHE:localBucket},async()=>{
 const redirectResolution=process.argv[5]==='route-rename'||process.argv[5]==='route-delete'
 const options={repo:'tanstack/query',gitRef:'main',docsRoot:'docs',artifactType:'docs-path-manifest',artifactKey:'default',isValue:isDocsManifest,build:()=>buildDocsPathManifest({repo:'tanstack/query',branch:'main',docsRoot:'docs'})}
 const redirectOptions={...options,artifactType:'docs-manifest',build:()=>buildDocsManifest({repo:'tanstack/query',branch:'main',docsRoot:'docs'})}
 const started=performance.now()
 if(mode!=='prime'){await markGitHubContentStale({repo:'tanstack/query',gitRef:'main'});await markDocsArtifactsStale({repo:'tanstack/query',gitRef:'main'})}
 for(const entry of selected)assert.ok(await fetchRepoFile(entry.repo,entry.ref,entry.file))
 const config=await fetchRepoFile('tanstack/query','main','docs/config.json');assert.ok(config);JSON.parse(config)
 const manifest=await getCachedDocsArtifact(options);assert.ok(manifest.paths.length>0)
 if(redirectResolution)await getCachedDocsArtifact(redirectOptions)
 if(process.argv[5]==='route-add'||process.argv[5]==='route-rename')assert.ok(manifest.paths.some(p=>p.includes('benchmark-added')))
 if(process.argv[5]==='route-rename'||process.argv[5]==='route-delete'){let canonical;await collectRedirectEntriesForFile({path:process.argv[6]},{docsRoot:'docs',fetchFile:async()=>null,onCanonicalPath:p=>canonical=p});assert.ok(canonical);assert.ok(!manifest.paths.includes(canonical))}
 console.log(JSON.stringify({mode,requested_documents:selected.length,native_refresh_seconds:(performance.now()-started)/1000,canonical_paths:manifest.paths.length,real_local_R2:true,path_manifest:true,redirect_manifest:redirectResolution,unchanged_private_helper_export_shim:true,live_edge_cache_purge:false,production_writes:false,captured_origin_GETs:fixtureCalls.length,raw_document_GETs:fixtureCalls.filter(r=>new URL(r.url).hostname==='raw.githubusercontent.com').length}))
})
}finally{await worker.dispose()}
