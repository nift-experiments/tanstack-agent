import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const baselineRoot=process.env.TANSTACK_BASELINE_DIR||new URL('../../../tanstack-baseline/',import.meta.url).pathname;
const {chromium}=await import(baselineRoot+'/toolchain/browser/node_modules/playwright/index.mjs');
const base=baselineRoot;const browser=await chromium.launch({headless:true,executablePath:'/home/nick/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'});let results=[];
try{for(const [name,port] of [['upstream',4021],['tanstack',4022],['tanstack-agent',4023]]){
const origin='http://localhost:'+port;const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin===origin&&!u.pathname.startsWith('/_a/'))return route.continue();return route.fulfill({status:503,body:'External transport blocked'})});const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/start/latest/docs/framework/react/build-from-scratch','/stats/npm','/chat']){
const response=await page.goto(origin+route,{waitUntil:'networkidle'});const record={name,route,status:response.status(),title:await page.title(),headings:await page.locator('h1,h2,h3').allTextContents(),buttons:await page.getByRole('button').allTextContents(),errors:[...errors]};
if(route.includes('build-from-scratch')){const tabs=page.getByRole('tab');record.tabs=await tabs.allTextContents();assert.ok(await tabs.count()>1);await tabs.nth(1).click();assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');record.tabInteraction=true;const copy=page.getByRole('button',{name:'Copy code to clipboard',exact:true});await copy.first().click();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).length>0);record.codeCopy=true}
fs.mkdirSync(path.join(base,'rich-proof'),{recursive:true});await page.screenshot({path:path.join(base,'rich-proof',name+'-'+encodeURIComponent(route)+'.png'),fullPage:true});results.push(record);errors=[];
}
await context.close()}
fs.writeFileSync(path.join(base,'rich-proof/results.json'),JSON.stringify({results,live_backend_integration:false},null,2));console.log(JSON.stringify(results.map(r=>({name:r.name,route:r.route,status:r.status,tabs:r.tabs,errors:r.errors}))));}finally{await browser.close()}
