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
await mf.ready;
console.log('LOCAL_FIXTURE_READY http://localhost:4021');
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,async()=>{fs.writeFileSync(path.join(base,'runtime-browser-outbound.json'),JSON.stringify(fixtureCalls,null,2));await mf.dispose();process.exit(0)});
