import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const runtime=resolve('../../tanstack-agent/runtime')
const require=createRequire(runtime+'/package.json')
const {build}=require('esbuild')
const started=performance.now()
try {
 const result=await build({absWorkingDir:runtime,stdin:{contents:"import { getRouter } from './src/router'; import { StartClient } from '@tanstack/react-start/client'; export {getRouter, StartClient}",resolveDir:runtime,sourcefile:'architecture-probe.ts'},bundle:true,platform:'browser',format:'esm',write:false,metafile:false,logLevel:'warning',logLimit:20,alias:{'~':runtime+'/src','content-collections':runtime+'/.content-collections/generated'},loader:{'.svg':'dataurl','.png':'dataurl','.jpg':'dataurl','.woff2':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}})
 writeFileSync('esbuild-probe/result.json',JSON.stringify({status:'compiled-not-parity-proven',seconds:(performance.now()-started)/1000,outputBytes:result.outputFiles.reduce((n,f)=>n+f.contents.length,0),metafile:result.metafile},null,2))
} catch(error) {
 writeFileSync('esbuild-probe/result.json',JSON.stringify({status:'rejected-build-not-benchmark',seconds:(performance.now()-started)/1000,errors:error.errors?.map(({text,location,notes})=>({text,location,notes}))??String(error)},null,2))
 console.log('Probe rejected; diagnostic errors recorded without stubbing server behavior.')
}
