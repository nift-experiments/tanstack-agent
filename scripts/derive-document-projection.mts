import {readState,writeState} from './cache-state.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'


import { documentProjectionPrefix } from '../runtime/src/utils/document-projection'

// Authored model: normal derivation. Agent model: explicit maintenance conversion.
const inputs = process.argv[2] === '--manifest'
  ? JSON.parse(fs.readFileSync(process.argv[3]!, 'utf8'))
  : [{source: process.argv[2], output: process.argv[3]}]
const project=path.resolve('..')
const cacheFile=process.argv.includes('--cache-file')?process.argv[process.argv.indexOf('--cache-file')+1]:path.join(project,'.rendered/derive-cache.json')
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const version=hash(fs.readFileSync(path.join(project,'scripts/cache-state.mjs')))+hash(fs.readFileSync(path.join(project,'runtime/src/utils/document-projection.ts')))+hash(fs.readFileSync(new URL(import.meta.url)))+hash(fs.readFileSync(path.join(project,'runtime/pnpm-lock.yaml')))+['processor.ts','filterFrameworkContent.ts','live-example.ts','installCommand.ts'].map(file=>hash(fs.readFileSync(path.join(project,'runtime/src/utils/markdown',file)))).join('')
const old=readState(cacheFile)
const cache=!process.argv.includes('--full')&&old.version===version?old.entries:{}
const next={version,entries:{}}
let renderer,frameworkFilter
let derived=0;let reused=0
for (const input of inputs) {
const source = fs.readFileSync(input.source, 'utf8')
const signature=hash(source)+(input.rawSource?hash(fs.readFileSync(input.rawSource)):'')
if(cache?.[input.output]?.input_sha256===signature&&fs.existsSync(input.output)&&hash(fs.readFileSync(input.output))===cache[input.output].output_sha256){next.entries[input.output]=cache[input.output];reused++;continue}
derived++
renderer??=await import('../runtime/src/utils/markdown/processor');const {parseSiteMarkdown}=renderer
frameworkFilter??=await import('../runtime/src/utils/markdown/filterFrameworkContent');const {extractFrameworksFromMarkdown}=frameworkFilter
const match = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/)
const frontmatter = match?.[1] ?? ''
const body = match?.[2] ?? source
const result = frontmatter + documentProjectionPrefix + JSON.stringify({
  document: parseSiteMarkdown(body),
  frameworks: extractFrameworksFromMarkdown(body),
  downloadMarkdown: body,
  ...(input.rawSource ? {originalRawMarkdown: fs.readFileSync(input.rawSource, 'utf8')} : {}),
}) + '\n'
fs.mkdirSync(new URL('.', 'file://' + input.output).pathname, {recursive: true})
next.entries[input.output]={input_sha256:signature,output_sha256:hash(result)}
if (!fs.existsSync(input.output) || fs.readFileSync(input.output, 'utf8') !== result) fs.writeFileSync(input.output, result)
}

fs.mkdirSync(path.dirname(cacheFile),{recursive:true})
writeState(cacheFile,next)
console.log(JSON.stringify({derived,reused,forced:process.argv.includes('--full')}))
