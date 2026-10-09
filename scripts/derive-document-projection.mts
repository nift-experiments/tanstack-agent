import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { parseSiteMarkdown } from '../runtime/src/utils/markdown/processor'
import { extractFrameworksFromMarkdown } from '../runtime/src/utils/markdown/filterFrameworkContent'
import { documentProjectionPrefix } from '../runtime/src/utils/document-projection'

// Authored model: normal derivation. Agent model: explicit maintenance conversion.
const inputs = process.argv[2] === '--manifest'
  ? JSON.parse(fs.readFileSync(process.argv[3]!, 'utf8'))
  : [{source: process.argv[2], output: process.argv[3]}]
const project=path.resolve('..')
const cacheFile=path.join(project,'.rendered/derive-cache.json')
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const version=hash(fs.readFileSync(path.join(project,'runtime/src/utils/document-projection.ts')))+hash(fs.readFileSync(new URL(import.meta.url)))+hash(fs.readFileSync(path.join(project,'runtime/pnpm-lock.yaml')))+['processor.ts','filterFrameworkContent.ts','live-example.ts'].map(file=>hash(fs.readFileSync(path.join(project,'runtime/src/utils/markdown',file)))).join('')
const old=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{}
const cache=!process.argv.includes('--full')&&old.version===version?old.entries:{}
const next={version,entries:{}}
let derived=0;let reused=0
for (const input of inputs) {
const source = fs.readFileSync(input.source, 'utf8')
const signature=hash(source)+(input.rawSource?hash(fs.readFileSync(input.rawSource)):'')
next.entries[input.output]=signature
if(cache?.[input.output]===signature&&fs.existsSync(input.output)){reused++;continue}
derived++
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
if (!fs.existsSync(input.output) || fs.readFileSync(input.output, 'utf8') !== result) fs.writeFileSync(input.output, result)
}

fs.mkdirSync(path.dirname(cacheFile),{recursive:true})
fs.writeFileSync(cacheFile,JSON.stringify(next))
console.log(JSON.stringify({derived,reused,forced:process.argv.includes('--full')}))
