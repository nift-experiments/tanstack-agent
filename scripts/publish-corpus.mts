import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { readDocumentProjection } from '../runtime/src/utils/document-projection'
import { collectRedirectEntriesForFile } from '../runtime/src/utils/docs.functions'
import { buildFileTreeFromRecursiveTree } from '../runtime/src/utils/documents.server'
import { buildRedirectManifest } from '../runtime/src/utils/redirects'
const project = path.resolve('..')
const authored = JSON.parse(fs.readFileSync(path.join(project,'investigation/init-guidance.json'),'utf8')).source_model === 'authored'
const inventory = JSON.parse(fs.readFileSync(path.join(project,'sources/docs-inputs.json'),'utf8'))
const phases: Record<string,number> = {}
const started = performance.now()
function command(args: string[]) {
 const result = spawnSync(process.execPath,['--import','tsx',...args],{stdio:'inherit'})
 assert.equal(result.status,0,'Publication child process failed')
}
if(authored) {
 let time = performance.now();command(['../scripts/resolve-corpus.mts']);phases.compatibility=(performance.now()-time)/1000
 time=performance.now();command(['../scripts/derive-document-projection.mts','--manifest','../.rendered/derive-corpus.json']);phases.markdown_projection=(performance.now()-time)/1000
}
const time = performance.now()
const destination = path.join(project,'publication/client')
fs.mkdirSync(destination,{recursive:true})
const manifest = {version:2,rawFiles:{},files:{},projections:{},metadata:{},trees:{},roots:inventory.roots.map((r) => `${r.repo}@${r.ref}:${r.docsRoot}/`)}
const tracked = []
function writeChanged(file: string, value: string | Buffer) {
 fs.mkdirSync(path.dirname(file),{recursive:true})
 const bytes = Buffer.isBuffer(value)?value:Buffer.from(value)
 if(!fs.existsSync(file)||!fs.readFileSync(file).equals(bytes))fs.writeFileSync(file,bytes)
}
function compose(name: string, source: string) {
 writeChanged(path.join(project,'content',name+'.html'),'@dep('+JSON.stringify(source)+')$[rawHtml('+JSON.stringify(source)+')]')
 tracked.push({name,title:name,template:'templates/template.html'})
}
const raw = new Map<string,string>()
const metadataSources = new Map<string,string>()
const wanted = new Set<string>()
for(const entry of inventory.files) {
 const slug = entry.repo.replaceAll('/','--')+'--'+entry.ref
 const key = `${entry.repo}@${entry.ref}:${entry.file}`
 const source = authored?path.join(project,'.rendered/resolved',slug,entry.file):path.join(project,entry.source)
 let content = fs.readFileSync(source,'utf8')
 const binary = !entry.file.endsWith('.md') && !entry.file.endsWith('.mdx')
 let original = authored ? fs.readFileSync(path.join(project,entry.source),'utf8') : content
 metadataSources.set(key,content)
 let projection: string | undefined
 if(entry.render) {
  projection = authored?'.rendered/projections/'+slug+'/'+entry.file+'.document':entry.source
  if(!authored) {
   const split=content.indexOf('NIFT_TANSTACK_DOCUMENT_V1\n')
   const packet=readDocumentProjection(content.slice(split))
   assert.ok(packet)
   const envelope: unknown=JSON.parse(content.slice(split+'NIFT_TANSTACK_DOCUMENT_V1\n'.length))
   assert.ok(typeof envelope==='object' && envelope!==null)
   const maintainedRaw: unknown=Reflect.get(envelope,'originalRawMarkdown')
   assert.equal(typeof maintainedRaw,'string')
   original=String(maintainedRaw)
   content=content.slice(0,split)+packet.downloadMarkdown
  }
  const name='_nift/docs/render/'+slug+'/'+entry.file
  if(content !== '') {compose(name,projection);manifest.projections[key]='/'+name+'.txt';wanted.add(name+'.txt')}
 }
 const originalName='_nift/docs/original/'+slug+'/'+entry.file+'.txt'
 writeChanged(path.join(destination,originalName),binary?fs.readFileSync(authored?path.join(project,entry.source):source):original)
 manifest.rawFiles[key]='/'+originalName;wanted.add(originalName)
 const name='_nift/docs/raw/'+slug+'/'+entry.file+'.txt'
 writeChanged(path.join(destination,name),binary?fs.readFileSync(source):content)
 manifest.files[key]='/'+name;raw.set(key,content);wanted.add(name)
}
for(const root of inventory.roots) {
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
  redirects.push(...await collectRedirectEntriesForFile({path:entry.file},{docsRoot:root.docsRoot,fetchFile:async(file)=>metadataSources.get(`${root.repo}@${root.ref}:${file}`)??null,onCanonicalPath:(canonical)=>paths.push(canonical)}))
 }
 const value={paths,redirects:buildRedirectManifest(redirects,{label:key})}
 const slug=root.repo.replaceAll('/','--')+'--'+root.ref
 const name='_nift/docs/metadata/'+slug+'/'+root.docsRoot
 const source='.rendered/metadata/'+slug+'/'+root.docsRoot+'.json'
 writeChanged(path.join(project,source),JSON.stringify(value));compose(name,source)
 manifest.metadata[key]='/'+name+'.txt';wanted.add(name+'.txt')
}
const manifestPath='.rendered/docs-manifest.json'
writeChanged(path.join(project,manifestPath),JSON.stringify(manifest));compose('_nift/docs-manifest',manifestPath)
writeChanged(path.join(project,'.nift/tracked.json'),JSON.stringify({tracked},null,2))
const wrappers = new Set(tracked.map((entry)=>path.join(project,'content',entry.name+'.html')))
const generatedContent = path.join(project,'content/_nift')
for(const entry of fs.readdirSync(generatedContent,{recursive:true,withFileTypes:true})) {
 if(entry.isFile()) {
  const full=path.join(entry.parentPath,entry.name)
  if(!wrappers.has(full))fs.unlinkSync(full)
 }
}
phases.publication_preparation=(performance.now()-time)/1000
const nift=path.resolve(project,'../tanstack-baseline/toolchain/nift-v4.9.0')
const niftTime=performance.now();const built=spawnSync(nift,['build',...(process.argv.includes('--full')?['--all']:[])],{cwd:project,stdio:'inherit'});assert.equal(built.status,0);phases.nift_composition=(performance.now()-niftTime)/1000
// Delete stale owned assets after rename/delete; unrelated retained assets are untouched.
const owned=path.join(destination,'_nift/docs')
for(const entry of fs.readdirSync(owned,{recursive:true,withFileTypes:true})) {
 if(!entry.isFile())continue
 const full=path.join(entry.parentPath,entry.name);const relative=path.relative(destination,full)
 if(!wanted.has(relative))fs.unlinkSync(full)
}
phases.complete_content_publication=(performance.now()-started)/1000
writeChanged(path.join(project,'.rendered/publication-phases.json'),JSON.stringify({authored,files:inventory.files.length,phases},null,2)+'\n')
console.log(JSON.stringify(phases))
