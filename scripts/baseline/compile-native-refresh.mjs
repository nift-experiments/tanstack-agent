import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const base=process.env.TANSTACK_BASELINE_DIR||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../tanstack-baseline');const upstream=path.join(base,'build-work');const directory=path.join(upstream,'.native-benchmark');fs.mkdirSync(directory,{recursive:true});
const {build}=await import(pathToFileURL(path.join(upstream,'node_modules/esbuild/lib/main.js')).href);
let source=fs.readFileSync(new URL('./native-docs-refresh.mts',import.meta.url),'utf8');source=source.replace(/^const load=.*\n/m,'').replace(/^const (\{[^\n]+\})=await load\('src\/([^']+)'\)$/gm,"import $1 from '../src/$2'");
const entry=path.join(directory,'native-docs-refresh.mts');fs.writeFileSync(entry,source);
await build({entryPoints:[entry],outfile:path.join(directory,'native-docs-refresh.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',alias:{'~':path.join(upstream,'src')},logLevel:'warning'});
console.log(path.join(directory,'native-docs-refresh.mjs'));
