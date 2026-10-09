import fs from 'node:fs';import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fixtureOutbound} from './baseline/fixture-provider.mjs';
const project=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const {Miniflare,convertV4MiniflareOptions}=await import(path.join(project,'runtime/node_modules/miniflare/dist/src/index.js'));
export async function createProofWorker(port=4022){
 const dist=path.join(project,'publication'),server=path.join(dist,'server');
 const modules=fs.readdirSync(server,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs')).sort((a,b)=>(a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b))).map(p=>({type:'ESModule',path:path.join(server,p)}));
 const worker=new Miniflare(convertV4MiniflareOptions({name:'tanstack-migration-proof',port,modules,modulesRoot:server,compatibilityDate:'2026-06-19',compatibilityFlags:['nodejs_compat'],assets:{directory:path.join(dist,'client'),binding:'ASSETS',run_worker_first:false,routerConfig:{has_user_worker:true}},bindings:{APP_MODE:'production',MCP_EGRESS_MODE:'cloudflare-public',SESSION_SECRET:'local-fixture-only-not-a-production-secret'},durableObjects:{STREAMS:{className:'StreamObject',useSQLite:true},WORKSPACE_SYNC:{className:'WorkspaceSync',useSQLite:true},CONVERSATIONS:{className:'Conversation',useSQLite:true}},r2Buckets:['GITHUB_CONTENT_CACHE','NPM_DOWNLOAD_CACHE','BUILDER_PROJECTS','FILES'],workflows:{WORKFLOW_RUNS:{name:'local-tanstack-chat-workflows',className:'TanChatWorkflow'}},outboundService:fixtureOutbound}));
 await worker.ready;return worker;
}
