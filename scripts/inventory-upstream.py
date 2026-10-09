#!/usr/bin/env python3
"""Read-only inventory of the pinned upstream; patterns are not concrete pages."""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('upstream',type=Path);p.add_argument('output',type=Path);a=p.parse_args();u=a.upstream.resolve()
sha=subprocess.check_output(['git','-C',str(u),'rev-parse','HEAD'],text=True).strip()
tracked=subprocess.check_output(['git','-C',str(u),'ls-files','-z']).decode().split('\0');tracked=[x for x in tracked if x]
tree=(u/'src/routeTree.gen.ts').read_text();section=tree.split('export interface FileRoutesByFullPath {',1)[1].split('\n}',1)[0];patterns=re.findall(r"^  '([^']+)':",section,re.M)
route_files=[];functions=[];imports=[]
for name in tracked:
 if not name.endswith(('.ts','.tsx','.mjs','.js')):continue
 s=(u/name).read_text()
 if name.startswith('src/routes/'):
  route_files.append({'source':name,'router_paths':re.findall(r"createFileRoute\(\s*['\"]([^'\"]+)['\"]",s),'server_handler_surface':bool(re.search(r'\bserver\s*:',s)),'dynamic_parameters':'$' in name,'http_methods':sorted(set(re.findall(r'\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*:',s)))})
 for m in re.finditer(r'\bcreateServerFn\s*\(',s):functions.append({'source':name,'line':s[:m.start()].count('\n')+1})
 if re.search(r"from ['\"]@tanstack/",s):imports.append(name)
assets=[{'path':n,'bytes':(u/n).stat().st_size,'sha256':hashlib.sha256((u/n).read_bytes()).hexdigest()} for n in tracked if n.startswith('public/')]
posts=[n for n in tracked if n.startswith('src/blog/') and n.endswith('.md')]
receipts={'upstream_sha':sha,'route_pattern_source':'src/routeTree.gen.ts:FileRoutesByFullPath','route_pattern_count':len(patterns),'route_patterns':patterns,'warning':'Route patterns include layout/server/parameterized paths. Concrete docs routes require external manifest inventories; no corpus/parity claim is made.','route_files':route_files,'server_function_callsites':functions,'tanstack_import_sources':imports,'blog_inputs':posts,'static_assets':assets,'static_asset_bytes':sum(x['bytes'] for x in assets),'input_hashes':{n:hashlib.sha256((u/n).read_bytes()).hexdigest() for n in ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.nvmrc','vite.config.ts','wrangler.jsonc','content-collections.ts','src/router.tsx','src/server.ts','src/routeTree.gen.ts']}}
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(receipts,indent=2)+'\n');print(json.dumps({'upstream_sha':sha,'route_patterns':len(patterns),'route_files':len(route_files),'api_patterns':sum(x.startswith('/api/') for x in patterns),'server_function_callsites':len(functions),'local_blog_inputs':len(posts),'static_assets':len(assets),'static_asset_bytes':receipts['static_asset_bytes']},indent=2))
