import fs from 'node:fs'
import { parseSiteMarkdown } from '../runtime/src/utils/markdown/processor'
import { extractFrameworksFromMarkdown } from '../runtime/src/utils/markdown/filterFrameworkContent'
import { documentProjectionPrefix } from '../runtime/src/utils/document-projection'

// Authored model: normal derivation. Agent model: explicit maintenance conversion.
const inputs = process.argv[2] === '--manifest'
  ? JSON.parse(fs.readFileSync(process.argv[3]!, 'utf8'))
  : [{source: process.argv[2], output: process.argv[3]}]
for (const input of inputs) {
const source = fs.readFileSync(input.source, 'utf8')
const match = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/)
const frontmatter = match?.[1] ?? ''
const body = match?.[2] ?? source
const result = frontmatter + documentProjectionPrefix + JSON.stringify({
  document: parseSiteMarkdown(body),
  frameworks: extractFrameworksFromMarkdown(body),
  downloadMarkdown: body,
}) + '\n'
fs.mkdirSync(new URL('.', 'file://' + input.output).pathname, {recursive: true})
if (!fs.existsSync(input.output) || fs.readFileSync(input.output, 'utf8') !== result) fs.writeFileSync(input.output, result)
}
