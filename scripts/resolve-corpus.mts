import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fetchRepoFileFromOrigin } from '../runtime/src/utils/documents.server'
const project=path.resolve('..')
const inventory=JSON.parse(fs.readFileSync(path.join(project,'sources/docs-inputs.json'),'utf8'))
const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const version=digest(fs.readFileSync(path.join(project,'runtime/pnpm-lock.yaml')))+digest(fs.readFileSync(path.join(project,'runtime/src/utils/markdown/processor.ts')))+digest(fs.readFileSync(path.join(project,'runtime/src/utils/documents.server.ts')))+digest(fs.readFileSync(new URL(import.meta.url)))
const cacheFile=path.join(project,'.rendered/resolve-cache.json')
const previous=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{}
const cache=!process.argv.includes('--full')&&previous.version===version?previous.entries:{}
const next={version,entries:{}}
const reads=new Map<string,Buffer|null>()
function read(file:string){if(!reads.has(file))reads.set(file,fs.existsSync(file)?fs.readFileSync(file):null);return reads.get(file)!}
function signature(file:string){const bytes=read(file);return bytes===null?null:digest(bytes)}
const inputs=[];let resolved=0;let reused=0
for(const entry of inventory.files){
 const slug=entry.repo.replaceAll('/','--')+'--'+entry.ref
 const rawRoot=path.join(project,'sources/docs',slug)
 const output=path.join(project,'.rendered/resolved',slug,entry.file)
 const key=entry.repo+'@'+entry.ref+':'+entry.file
 const old=cache?.[key]
 if(old&&fs.existsSync(output)&&Object.entries(old.dependencies).every(([file,hash])=>signature(file)===hash)){
  next.entries[key]=old;reused++
 }else{
  const dependencies={}
  const maintainedRead=async(file:string)=>{const location=path.join(rawRoot,file);dependencies[location]=signature(location);const bytes=read(location);return bytes===null?null:bytes.toString('utf8')}
  let processed:string|Buffer|null
  if(entry.file.endsWith('.md'))processed=await fetchRepoFileFromOrigin(entry.repo,entry.ref,entry.file,maintainedRead)
  else{const location=path.join(rawRoot,entry.file);dependencies[location]=signature(location);processed=read(location)}
  if(processed===null)throw new Error('Unresolved maintained document: '+entry.file)
  fs.mkdirSync(path.dirname(output),{recursive:true})
  const bytes=Buffer.isBuffer(processed)?processed:Buffer.from(processed)
  if(!fs.existsSync(output)||!fs.readFileSync(output).equals(bytes))fs.writeFileSync(output,bytes)
  next.entries[key]={dependencies};resolved++
 }
 if(entry.render)inputs.push({source:output,output:path.join(project,'.rendered/projections',slug,entry.file+'.document')})
}
fs.writeFileSync(cacheFile,JSON.stringify(next))
fs.writeFileSync(path.join(project,'.rendered/derive-corpus.json'),JSON.stringify(inputs))
console.log(JSON.stringify({resolved,reused,dependency_model:'actual upstream resolver reads, including missing references'}))
