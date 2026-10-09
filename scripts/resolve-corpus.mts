import fs from 'node:fs'
import path from 'node:path'
import { fetchRepoFileFromOrigin } from '../runtime/src/utils/documents.server'
const project = path.resolve('..')
const inventory = JSON.parse(fs.readFileSync(path.join(project,'sources/docs-inputs.json'),'utf8'))
const inputs = []
for (const entry of inventory.files) {
  const slug = entry.repo.replaceAll('/','--')+'--'+entry.ref
  const rawRoot = path.join(project,'sources/docs',slug)
  if (!entry.file.endsWith('.md')) {
    const output = path.join(project,'.rendered/resolved',slug,entry.file)
    fs.mkdirSync(path.dirname(output),{recursive:true})
    fs.copyFileSync(path.join(rawRoot,entry.file),output)
    continue
  }
  const processed = await fetchRepoFileFromOrigin(entry.repo,entry.ref,entry.file,async (file) => {
    const location = path.join(rawRoot,file)
    return fs.existsSync(location) ? fs.readFileSync(location,'utf8') : null
  })
  const output = path.join(project,'.rendered/resolved',slug,entry.file)
  fs.mkdirSync(path.dirname(output),{recursive:true})
  if (processed === null) throw new Error('Unresolved maintained document: '+entry.file)
  fs.writeFileSync(output,processed)
  if(entry.render) inputs.push({source:output,output:path.join(project,'.rendered/projections',slug,entry.file+'.document')})
}
fs.writeFileSync(path.join(project,'.rendered/derive-corpus.json'),JSON.stringify(inputs))
console.log(inventory.files.length+' documents resolved with upstream ref/section/image rules')
