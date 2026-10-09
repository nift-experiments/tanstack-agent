const baselineRoot=process.env.TANSTACK_BASELINE_DIR||new URL('../../../tanstack-baseline/',import.meta.url).pathname;
const {Miniflare,convertV4MiniflareOptions}=await import(baselineRoot+'/build-work/node_modules/miniflare/dist/src/index.js');
import {fixtureOutbound,fixtureCalls} from './fixture-provider.mjs';
import fs from 'node:fs';import path from 'node:path';
const base=process.env.TANSTACK_BASELINE_DIR||path.resolve(path.dirname(new URL(import.meta.url).pathname),'../../../tanstack-baseline'), dist=path.join(base,'reference-production-build1');let blocked=[];
const server=path.join(dist,'server');const modules=fs.readdirSync(server,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs')||p.endsWith('.wasm')).sort((a,b)=>(a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b))).map(p=>({type:p.endsWith('.wasm')?'CompiledWasm':'ESModule',path:path.join(server,p)}));
const mf=new Miniflare(convertV4MiniflareOptions({
 name:'tanstack-baseline-local',port:4021,modules,modulesRoot:server,compatibilityDate:'2026-06-19',compatibilityFlags:['nodejs_compat'],
 assets:{directory:path.join(dist,'client'),binding:'ASSETS',run_worker_first:false,routerConfig:{has_user_worker:true}},
 bindings:{APP_MODE:'production',MCP_EGRESS_MODE:'cloudflare-public',SESSION_SECRET:'local-fixture-only-not-a-production-secret'},
 durableObjects:{STREAMS:{className:'StreamObject',useSQLite:true},WORKSPACE_SYNC:{className:'WorkspaceSync',useSQLite:true},CONVERSATIONS:{className:'Conversation',useSQLite:true}},r2Buckets:['GITHUB_CONTENT_CACHE','NPM_DOWNLOAD_CACHE','BUILDER_PROJECTS','FILES'],workflows:{WORKFLOW_RUNS:{name:'local-tanstack-chat-workflows',className:'TanChatWorkflow'}},
 outboundService:fixtureOutbound
}));
try {await mf.ready;const results=[];for(const route of ['/','/ethos','/brand-guide','/blog','/query/latest/docs/framework/react/overview','/query/latest/docs/framework/react/guides/queries','/query/latest/docs','/query/v5/docs/framework/react/overview.md','/robots.txt','/missing-baseline-route','/api/auth/cli/status/unknown-fixture-ticket']){const response=await mf.dispatchFetch('http://localhost:4021'+route);const body=await response.text();results.push({route,status:response.status,headers:Object.fromEntries(response.headers),bytes:Buffer.byteLength(body),sample:body.slice(0,100)});fs.mkdirSync(path.join(base,'runtime-smoke'),{recursive:true});fs.writeFileSync(path.join(base,'runtime-smoke',encodeURIComponent(route)+'.body'),body)}fs.writeFileSync(path.join(base,'runtime-smoke.json'),JSON.stringify({results,fixtureCalls,live_backend_integration:false},null,2));console.log(JSON.stringify(results.map(({route,status,bytes})=>({route,status,bytes}))))} finally {await mf.dispose()}
