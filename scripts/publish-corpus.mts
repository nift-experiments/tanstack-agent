import {readState,writeState} from './cache-state.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { readDocumentProjection } from '../runtime/src/utils/document-projection'
import { getCanonicalDocsPath, normalizeDocsRedirectPath } from '../runtime/src/utils/docs.functions'
import { buildFileTreeFromRecursiveTree, parseFrontMatter } from '../runtime/src/utils/documents.server'
import { buildRedirectManifest, normalizeRedirectFrom } from '../runtime/src/utils/redirects'
import { createHash } from 'node:crypto'
const traceDurations={};let tracePhase='startup',traceStarted=performance.now();const mark=(phase:string)=>{const now=performance.now();traceDurations[tracePhase]=(traceDurations[tracePhase]??0)+(now-traceStarted)/1000;tracePhase=phase;traceStarted=now;console.log('NIFT_PHASE '+phase)}
mark('content_discovery')
const project = path.resolve('..')
const authored = JSON.parse(fs.readFileSync(path.join(project,'investigation/init-guidance.json'),'utf8')).source_model === 'authored'
const inventory = JSON.parse(fs.readFileSync(path.join(project,'sources/docs-inputs.json'),'utf8'))
const phases: Record<string,number> = {}
const started = performance.now()
function command(args: string[]) {
 const result = spawnSync(process.execPath,[...(args[0].endsWith('.mts')?['--import','tsx']:[]),...args],{stdio:'inherit'})
 assert.equal(result.status,0,'Publication child process failed')
}
if(authored) {
 mark('compatibility_process');let time = performance.now();command(['../scripts/compile-publisher.mjs','--resolve',...(process.argv.includes('--full')?['--full']:[])]);command(['../.rendered/resolve-corpus.mjs',...(process.argv.includes('--full')?['--full']:[])]);phases.compatibility=(performance.now()-time)/1000
 mark('markdown_projection_process');time=performance.now();command(process.argv.includes('--full')?['../scripts/derive-parallel.mjs','4']:['../scripts/derive-document-projection.mts','--manifest','../.rendered/derive-corpus.json']);phases.markdown_projection=(performance.now()-time)/1000
}
mark('projection_assets_and_revision');const time = performance.now()
const destination = path.join(project,'publication/client')
fs.mkdirSync(destination,{recursive:true})
const revision=createHash('sha256');revision.update(JSON.stringify(inventory));revision.update(fs.readFileSync(path.join(project,'scripts/publish-corpus.mts')))
const manifest = {version:2,revision:'',rawFiles:{},files:{},projections:{},metadata:{},trees:{},roots:inventory.roots.map((r) => `${r.repo}@${r.ref}:${r.docsRoot}/`)}
const tracked = []
const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const cacheFile=path.join(project,'.rendered/publication-records.json')
const cacheVersion=digest(fs.readFileSync(path.join(project,'scripts/cache-state.mjs')))+digest(fs.readFileSync(path.join(project,'scripts/publish-corpus.mts')))+digest(fs.readFileSync(path.join(project,'runtime/pnpm-lock.yaml')))+['documents.server.ts','docs.functions.ts','document-projection.ts','redirects.ts','utils.ts','repo-path.ts'].map(file=>digest(fs.readFileSync(path.join(project,'runtime/src/utils',file)))).join('')
const old=readState(cacheFile)
const records=!process.argv.includes('--full')&&old.version===cacheVersion?old.records:{}
const nextRecords={}
let recordHits=0,recordMisses=0,corruptCompositions=0
const compositionInputs=[]
const compositionSignatures={}
function writeChanged(file: string, value: string | Buffer) {
 fs.mkdirSync(path.dirname(file),{recursive:true})
 const bytes = Buffer.isBuffer(value)?value:Buffer.from(value)
 if(!fs.existsSync(file)||!fs.readFileSync(file).equals(bytes))fs.writeFileSync(file,bytes)
}
function compose(name: string, source: string) {
 writeChanged(path.join(project,'content',name+'.html'),'@dep('+JSON.stringify(source)+')$[rawHtml('+JSON.stringify(source)+')]')
 tracked.push({name,title:name,template:'templates/template.html'});const sourceBytes=fs.readFileSync(path.join(project,source));const expected=digest(sourceBytes.at(-1)===10?sourceBytes.subarray(0,-1):sourceBytes);if(name!=='_nift/docs-manifest')revision.update(name+'\0'+expected);compositionInputs.push({output:path.join(destination,name+'.txt'),source:path.join(project,source),expected})
}
const metadataSources = new Map<string,string>()
const wanted = new Set<string>()
for(const entry of inventory.files) {
 const slug = entry.repo.replaceAll('/','--')+'--'+entry.ref
 const key = `${entry.repo}@${entry.ref}:${entry.file}`
 const maintainedBytes=fs.readFileSync(path.join(project,entry.source));revision.update(entry.source+'\0'+maintainedBytes.length+'\0');revision.update(maintainedBytes)
 const source = authored?path.join(project,'.rendered/resolved',slug,entry.file):path.join(project,entry.source)
 const resolvedBytes=authored?fs.readFileSync(source):maintainedBytes
 const maintainedSignature=digest(maintainedBytes);const signature=maintainedSignature+(authored?digest(resolvedBytes):maintainedSignature)
 const originalName='_nift/docs/original/'+slug+'/'+entry.file+'.txt'
 const name='_nift/docs/raw/'+slug+'/'+entry.file+'.txt'
 manifest.rawFiles[key]='/'+originalName;wanted.add(originalName)
 manifest.files[key]='/'+name;wanted.add(name)
 const projection=authored?'.rendered/projections/'+slug+'/'+entry.file+'.document':entry.source
 const oldRecord=records?.[key]
 const valid=oldRecord?.signature===signature&&Array.isArray(oldRecord.outputs)&&oldRecord.outputs.length===2&&oldRecord.outputs.every(row=>fs.existsSync(path.join(destination,row.file))&&digest(fs.readFileSync(path.join(destination,row.file)))===row.sha256)
 let record
 if(valid){record=oldRecord;recordHits++}
 else {
  recordMisses++
  let content=resolvedBytes.toString('utf8')
  const binary=!entry.file.endsWith('.md')&&!entry.file.endsWith('.mdx')
  let original=maintainedBytes.toString('utf8')
  // Preserve metadata semantics from original parser; do not retain corpus-sized AST strings.
  const metadata=parseFrontMatter(content).data
  if(entry.render&&!authored){
   const split=content.indexOf('NIFT_TANSTACK_DOCUMENT_V1\n')
   const packet=readDocumentProjection(content.slice(split));assert.ok(packet)
   const envelope=JSON.parse(content.slice(split+'NIFT_TANSTACK_DOCUMENT_V1\n'.length))
   assert.equal(typeof envelope.originalRawMarkdown,'string')
   original=envelope.originalRawMarkdown
   content=content.slice(0,split)+packet.downloadMarkdown
  }
  const originalBytes=binary?maintainedBytes:Buffer.from(original)
  const rawBytes=binary?resolvedBytes:Buffer.from(content)
  writeChanged(path.join(destination,originalName),originalBytes)
  writeChanged(path.join(destination,name),rawBytes)
  record={signature,metadata,nonempty:content!=='',outputs:[{file:originalName,sha256:digest(originalBytes)},{file:name,sha256:digest(rawBytes)}]}
 }
 nextRecords[key]=record;metadataSources.set(key,record.metadata)
 if(entry.render&&record.nonempty){const renderName='_nift/docs/render/'+slug+'/'+entry.file;compose(renderName,projection);manifest.projections[key]='/'+renderName+'.txt';wanted.add(renderName+'.txt')}

}
mark('metadata_navigation');for(const root of inventory.roots) {
 const scoped = inventory.files.filter((e)=>e.repo===root.repo&&e.ref===root.ref&&e.file.startsWith(root.docsRoot+'/'))
 const dirs = new Set<string>()
 const tree = scoped.map((e)=> {
  const parts = e.file.split('/');parts.pop()
  while(parts.length){dirs.add(parts.join('/'));parts.pop()}
  return {path:e.file,sha:e.original_git_blob,type:'blob',url:`https://api.github.com/repos/${e.repo}/contents/${e.file}?ref=${e.ref}`}
 })
 tree.push(...Array.from(dirs).map((dir)=>({path:dir,sha:'maintained-directory',type:'tree',url:`https://api.github.com/repos/${root.repo}/contents/${dir}?ref=${root.ref}`})))
 const treeSlug=root.repo.replaceAll('/','--')+'--'+root.ref
 const treeName='_nift/docs/trees/'+treeSlug+'/'+root.docsRoot
 const treeSource='.rendered/trees/'+treeSlug+'/'+root.docsRoot+'.json'
 writeChanged(path.join(project,treeSource),JSON.stringify(tree));compose(treeName,treeSource)
 manifest.trees[`${root.repo}@${root.ref}:${root.docsRoot}`]='/'+treeName+'.txt';wanted.add(treeName+'.txt')
 const key = `${root.repo}@${root.ref}:${root.docsRoot}`
 const paths: string[]=[];const redirects=[]
 const flatten = (nodes) => nodes.flatMap((node)=>[node,...flatten(node.children??[])])
 for(const entry of flatten(buildFileTreeFromRecursiveTree(tree,root.docsRoot)??[]).filter((node)=>node.path.endsWith('.md')).map((node)=>({file:node.path}))) {
  const canonical=getCanonicalDocsPath(entry.file,root.docsRoot)
  if(canonical===null)continue
  paths.push(canonical)
  const file=metadataSources.get(`${root.repo}@${root.ref}:${entry.file}`)
  if(!file)continue
  for(const redirectFrom of normalizeRedirectFrom(file.redirect_from)??[]) {
   const from=normalizeDocsRedirectPath(redirectFrom,root.docsRoot)
   if(from&&from!==canonical)redirects.push({from,to:canonical,source:entry.file})
  }
 }
 const value={paths,redirects:buildRedirectManifest(redirects,{label:key})}
 const slug=root.repo.replaceAll('/','--')+'--'+root.ref
 const name='_nift/docs/metadata/'+slug+'/'+root.docsRoot
 const source='.rendered/metadata/'+slug+'/'+root.docsRoot+'.json'
 writeChanged(path.join(project,source),JSON.stringify(value));compose(name,source)
 manifest.metadata[key]='/'+name+'.txt';wanted.add(name+'.txt')
}
mark('state_serialization');manifest.revision=revision.digest('hex')
const manifestPath='.rendered/docs-manifest.json'
writeChanged(path.join(project,manifestPath),JSON.stringify(manifest));compose('_nift/docs-manifest',manifestPath);wanted.add('_nift/docs-manifest.txt')
writeChanged(path.join(project,'.nift/tracked.json'),JSON.stringify({tracked},null,2))
const wrappers = new Set(tracked.map((entry)=>path.join(project,'content',entry.name+'.html')))
const generatedContent = path.join(project,'content/_nift')
if(!process.argv.includes('--full')&&old.version===cacheVersion&&old.compositions){
 for(const output of Object.keys(old.compositions)){const full=path.join(project,'content',output.replace(/^publication\/client\//,'').replace(/\.txt$/,'.html'));if(!wrappers.has(full))fs.rmSync(full,{force:true})}
}else for(const entry of fs.readdirSync(generatedContent,{recursive:true,withFileTypes:true}))if(entry.isFile()){const full=path.join(entry.parentPath,entry.name);if(!wrappers.has(full))fs.unlinkSync(full)}
phases.publication_preparation=(performance.now()-time)/1000
const nift=path.resolve(project,'../tanstack-baseline/toolchain/nift-v4.9.0')
mark('nift_composition');const niftTime=performance.now();const built=spawnSync(nift,['build',...(process.argv.includes('--full')?['--all']:[])],{cwd:project,stdio:'inherit'});assert.equal(built.status,0);phases.nift_composition=(performance.now()-niftTime)/1000
mark('composition_verification');const verifyTime=performance.now()
// Pinned raw-composition contract: final LF is omitted; JSON/AST semantics and literal bytes otherwise preserved.
for(const row of compositionInputs){const expected=row.expected;compositionSignatures[path.relative(project,row.output)]=expected;if(!fs.existsSync(row.output)||digest(fs.readFileSync(row.output))!==expected)corruptCompositions++}
if(corruptCompositions){const repair=spawnSync(nift,['build','--all'],{cwd:project,stdio:'inherit'});assert.equal(repair.status,0);for(const row of compositionInputs)assert.equal(digest(fs.readFileSync(row.output)),compositionSignatures[path.relative(project,row.output)],'Raw composition bytes differ after repair')}
phases.output_verification_and_repair=(performance.now()-verifyTime)/1000
// Delete stale owned assets after rename/delete; unrelated retained assets are untouched.
mark('route_retirement');const owned=path.join(destination,'_nift/docs')
if(!process.argv.includes('--full')&&old.version===cacheVersion&&old.compositions){
 const prior=new Set([...Object.keys(old.compositions).map(file=>file.replace(/^publication\/client\//,'')),...Object.values(old.records??{}).flatMap(record=>record.outputs?.map(row=>row.file)??[])])
 for(const relative of prior)if(!wanted.has(relative))fs.rmSync(path.join(destination,relative),{force:true})
}else for(const entry of fs.readdirSync(owned,{recursive:true,withFileTypes:true})){if(!entry.isFile())continue;const full=path.join(entry.parentPath,entry.name);if(!wanted.has(path.relative(destination,full)))fs.unlinkSync(full)}
mark('cache_serialization');writeState(cacheFile,{version:cacheVersion,records:nextRecords,compositions:compositionSignatures});console.log(JSON.stringify({publication_record_hits:recordHits,publication_record_misses:recordMisses,composition_repairs:corruptCompositions}))
phases.complete_content_publication=(performance.now()-started)/1000
mark('complete');writeChanged(path.join(project,'.rendered/publication-phases.json'),JSON.stringify({authored,files:inventory.files.length,records:{hits:recordHits,misses:recordMisses,composition_repairs:corruptCompositions},phase_details:traceDurations,phases,counts:{roots:inventory.roots.length,composed:tracked.length,outputs:wanted.size},scope_notes:{React_SSR:'request-time; no page SSR in this publication command',hosted_search:'retained external service; no local index generation or private network calls'}},null,2)+'\n')
console.log(JSON.stringify(phases))
