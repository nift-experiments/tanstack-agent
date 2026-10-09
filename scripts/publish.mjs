import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {performance} from 'node:perf_hooks';
const project=path.dirname(path.dirname(fileURLToPath(import.meta.url)));const runtime=path.join(project,'runtime');const started=performance.now();const force=process.argv.includes('--full');
const ignored=new Set(['node_modules','dist','.content-collections','.tanstack','.wrangler','.git']);const hash=createHash('sha256');
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){if(ignored.has(entry.name)||entry.name.startsWith('.env'))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.isFile()){hash.update(path.relative(runtime,file));hash.update(fs.readFileSync(file))}}}
walk(runtime);const fingerprint=hash.digest('hex');fs.mkdirSync(path.join(project,'.rendered'),{recursive:true});const stamp=path.join(project,'.rendered/runtime-fingerprint');const rebuilt=force||!fs.existsSync(stamp)||fs.readFileSync(stamp,'utf8')!==fingerprint||!fs.existsSync(path.join(runtime,'dist/server/index.js'));
function run(args){const result=spawnSync('python3',[path.join(project,'scripts/run-runtime.py'),...args],{cwd:project,stdio:'inherit'});assert.equal(result.status,0,'Publication failed')}
const phases={};let phase=performance.now();if(rebuilt){run(['pnpm','build']);fs.writeFileSync(stamp,fingerprint)}phases.retained_vite_build=(performance.now()-phase)/1000;
phase=performance.now();
const publicationClient=path.join(project,'publication/client');fs.mkdirSync(publicationClient,{recursive:true});
for(const entry of fs.readdirSync(publicationClient))if(entry!=='_nift')fs.rmSync(path.join(publicationClient,entry),{recursive:true,force:true});
fs.rmSync(path.join(project,'publication/server'),{recursive:true,force:true});
for(const part of ['client','server'])fs.cpSync(path.join(runtime,'dist',part),path.join(project,'publication',part),{recursive:true});phases.retained_asset_publication=(performance.now()-phase)/1000;
phase=performance.now();run(['node','--import','tsx','../scripts/publish-corpus.mts',...(force?['--full']:[])]);phases.content_publication=(performance.now()-phase)/1000;phases.complete_pipeline=(performance.now()-started)/1000;
const content=JSON.parse(fs.readFileSync(path.join(project,'.rendered/publication-phases.json'),'utf8'));fs.writeFileSync(path.join(project,'.rendered/pipeline-phases.json'),JSON.stringify({force,runtime_rebuilt:rebuilt,runtime_fingerprint:fingerprint,phases,content_phases:content.phases},null,2)+'\n');console.log(JSON.stringify(phases));
