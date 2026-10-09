import os
import concurrent.futures,hashlib,json,subprocess
from pathlib import Path
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve();pins=json.loads((B/'docs-input-pins.json').read_text())['inputs'];libs=json.loads((B/'library-inputs.json').read_text());folder=B/'external-inputs/docs-trees';folder.mkdir(parents=True,exist_ok=True)
def capture(r):
 name=r['repo'].replace('/','--')+'--'+r['ref'];p=folder/(name+'.json');proc=subprocess.run(['gh','api','repos/'+r['repo']+'/git/trees/'+r['commit']+'?recursive=1'],capture_output=True)
 if proc.returncode:raise RuntimeError(r['repo']+': '+proc.stderr.decode()[:200])
 p.write_bytes(proc.stdout);tree=json.loads(proc.stdout);assert not tree.get('truncated'),r['repo'];roots={l['docs_root'] for l in libs if l['repo']==r['repo']};inputs=[x for x in tree['tree'] if x['type']=='blob' and any(x['path'].startswith(root+'/') for root in roots)]
 return {**r,'tree_file':str(p.relative_to(B)),'tree_sha256':hashlib.sha256(proc.stdout).hexdigest(),'docs_files':inputs,'markdown_files':sum(x['path'].endswith(('.md','.mdx')) for x in inputs)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(capture,pins))
(B/'docs-tree-inventory.json').write_text(json.dumps(out,indent=2)+'\n');print('Captured:',len(out),'trees;',sum(r['markdown_files'] for r in out),'versioned Markdown inputs (shared roots counted once per repo/ref)')
