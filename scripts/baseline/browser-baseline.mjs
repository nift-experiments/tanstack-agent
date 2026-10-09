const baselineRoot=process.env.TANSTACK_BASELINE_DIR||new URL('../../../tanstack-baseline/',import.meta.url).pathname;
const {chromium}=await import(baselineRoot+'/toolchain/browser/node_modules/playwright/index.mjs');
import fs from 'node:fs';import assert from 'node:assert/strict';
const base=new URL('file://'+baselineRoot+'/browser-baseline/');fs.mkdirSync(base,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TANSTACK_CHROMIUM||baselineRoot+'/toolchain/chromium-1234/chrome-linux64/chrome'});
let records=[],blocked=[],searchRequests=0;
try{for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
const context=await browser.newContext({viewport,reducedMotion:'reduce'});
await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='localhost'&&!u.pathname.startsWith('/_a/'))return route.continue();if(u.hostname.includes('algolia')){searchRequests++;let queries=JSON.parse(req.postData()||'{}').requests||[{}];return route.fulfill({json:{results:queries.map(()=>({hits:[],nbHits:0,page:0,nbPages:0,hitsPerPage:20,processingTimeMS:1,query:'fixture',params:'',facets:{},exhaustiveNbHits:true}))}})}blocked.push(u.origin+u.pathname);return route.fulfill({status:503,body:'External browser transport blocked'})});
const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/ethos','/brand-guide','/blog/announcing-tanstack-query-v5','/query/latest/docs/framework/react/overview','/query/latest/docs/framework/react/guides/queries','/missing-baseline-route']){
const response=await page.goto('http://localhost:4021'+route,{waitUntil:'networkidle'});assert.equal(response.status(),route.includes('missing')?404:200);
const record={route,viewport,status:response.status(),title:await page.title(),headings:await page.locator('h1,h2,h3').allTextContents(),canonical:await page.locator('link[rel=canonical]').getAttribute('href').catch(()=>null),errors:[...errors]};
await page.screenshot({path:new URL(encodeURIComponent(route)+'-'+viewport.width+'.png',base).pathname,fullPage:true});records.push(record);errors=[];
}
await page.goto('http://localhost:4021/query/latest/docs/framework/react/overview',{waitUntil:'networkidle'});
if(viewport.width>600){const theme=page.getByRole('button',{name:/^Theme:/});await theme.click();await page.getByRole('button',{name:/Theme: Dark/}).waitFor();assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),true);await theme.click();await page.getByRole('button',{name:/Theme: Light/}).waitFor();
records.push({scenario:'theme-cycle',viewport,passed:true});}else{await page.getByRole('button',{name:'Open Menu',exact:true}).click();await page.getByRole('navigation',{name:'Mobile navigation'}).waitFor();await page.getByRole('button',{name:'Close Menu',exact:true}).click();records.push({scenario:'mobile-navigation',viewport,passed:true});}
await page.keyboard.press('Control+k');await page.getByRole('combobox',{name:'Search TanStack'}).fill('queries');await page.getByRole('button',{name:'Close search'}).click();records.push({scenario:'search-local-empty-response',viewport,passed:true});
await context.close();}
assert.ok(searchRequests>0);fs.writeFileSync(new URL('results.json',base),JSON.stringify({records,blocked:[...new Set(blocked)],searchRequests,live_backend_integration:false},null,2));console.log(JSON.stringify({states:records.length,searchRequests,pageErrors:records.flatMap(r=>r.errors||[])}));}finally{await browser.close()}
