"""Five serialized samples, reversible real inputs, matching timed/RSS windows.
No cloud deployment, OS cache flushing, private calls or dev-server benchmark.
"""
from pathlib import Path
import os,sys,json,subprocess,time,hashlib,statistics,base64
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[3]/'tanstack-baseline'))).resolve()
out=base/'t10-final';out.mkdir(exist_ok=True)
workloads=['full','fresh','unchanged','body-1','body-10','body-100','navigation','metadata','shared-shell','island','collection','docs-sync','route-add','route-rename','route-delete']
if len(sys.argv)>1:workloads=sys.argv[1:]
rows=json.loads((out/'samples.json').read_text()) if (out/'samples.json').exists() else []
# Reproducible mutation definitions are committed; raw backups stay outside source repos.
journal=out/'current-mutation-backup.json'
if journal.exists():
 for row in json.loads(journal.read_text()):
  p=Path(row['path']);current=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
  if current not in [row['written_sha256'],row['original_sha256']]:raise RuntimeError('Concurrent source change; preserve journal and inspect '+str(p))
  if row['original_base64'] is None:p.unlink(missing_ok=True)
  else:p.write_bytes(base64.b64decode(row['original_base64']))
 journal.unlink()
class Changes:
 def __init__(self):self.old={};self.written={}
 def save(self):
  journal.write_text(json.dumps([{'path':str(p),'original_base64':None if b is None else base64.b64encode(b).decode(),'original_sha256':None if b is None else hashlib.sha256(b).hexdigest(),'written_sha256':self.written.get(p)} for p,b in self.old.items()],indent=2)+'\n')
 def write(self,p,b):
  p=Path(p)
  if p not in self.old:self.old[p]=p.read_bytes() if p.exists() else None
  b=b if isinstance(b,bytes) else b.encode();self.written[p]=hashlib.sha256(b).hexdigest();self.save();p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 def remove(self,p):
  p=Path(p)
  if p not in self.old:self.old[p]=p.read_bytes()
  self.written[p]=None;self.save();p.unlink()
 def restore(self):
  for p,b in self.old.items():
   current=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
   original=None if b is None else hashlib.sha256(b).hexdigest()
   if current not in [self.written.get(p),original]:raise RuntimeError('Concurrent source change; preserve journal and inspect '+str(p))
   if b is None:p.unlink(missing_ok=True)
   else:p.write_bytes(b)
  journal.unlink(missing_ok=True)
def tree_hash(root):
 if not root.exists():return {}
 return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
def proc(pid):
 try:
  text=Path(f'/proc/{pid}/status').read_text();rss=int(next(x.split()[1] for x in text.splitlines() if x.startswith('VmRSS:')))
  children=set()
  for task in Path(f'/proc/{pid}/task').iterdir():
   try:children.update(map(int,(task/'children').read_text().split()))
   except (FileNotFoundError,ProcessLookupError):pass
  return rss,children
 except (FileNotFoundError,ProcessLookupError,StopIteration):return 0,set()
def tree_rss(pid):
 todo=[pid];seen=set();total=0
 while todo:
  p=todo.pop()
  if p in seen:continue
  seen.add(p);rss,children=proc(p);total+=rss;todo.extend(children)
 return total
def measure(key,command,cwd):
 stamp=out/(key+'.time');peak=0;samples=0;started=time.monotonic()
 with (out/(key+'.log')).open('w') as log:
  p=subprocess.Popen(['/usr/bin/time','-v','-o',str(stamp),*command],cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
  while p.poll() is None:
   peak=max(peak,tree_rss(p.pid));samples+=1;time.sleep(.05)
  status=p.wait()
 elapsed=time.monotonic()-started
 if status:raise RuntimeError(key+' failed; inspect log')
 timing=stamp.read_text()
 rss=int(next(x.split(':',1)[1].strip() for x in timing.splitlines() if 'Maximum resident set size' in x))
 parts=next(x.rsplit(': ',1)[1].strip() for x in timing.splitlines() if 'Elapsed (wall clock)' in x).split(':')
 command_elapsed=sum(float(value)*60**i for i,value in enumerate(reversed(parts)))
 return {'wall_seconds':command_elapsed,'wrapper_wall_seconds':elapsed,'maximum_individual_process_rss_kib':rss,'sampled_descendant_tree_peak_rss_kib':peak,'tree_sampling_interval_ms':50,'tree_samples':samples,'load_average':os.getloadavg()}
auth=base.parent/'tanstack';agent=base.parent/'tanstack-agent'
auth_inventory=json.loads((auth/'sources/docs-inputs.json').read_text())
selected=[e for e in auth_inventory['files'] if e['repo']=='tanstack/query' and e['ref']=='main' and e['render'] and not e['request_time'] and e['file'].endswith('.md') and 'ref:' not in (auth/e['source']).read_text() and (auth/e['source']).stat().st_size>0][:100]
assert len(selected)==100
native_cases={'body-1','body-10','body-100','navigation','metadata','docs-sync','route-add','route-rename','route-delete'}
def edit_document(changes,project,inventory,entry,marker,metadata=False):
 row=next(e for e in inventory['files'] if (e['repo'],e['ref'],e['file'])==(entry['repo'],entry['ref'],entry['file']))
 p=project/row['source'];text=p.read_text()
 if project==agent:
  header,packet=text.split('NIFT_TANSTACK_DOCUMENT_V1\n',1);obj=json.loads(packet)
  if metadata:
   header=header.replace('title: ',f'title: {marker} ',1);obj['originalRawMarkdown']=obj['originalRawMarkdown'].replace('title: ',f'title: {marker} ',1)
  else:
   obj['document']['children'].append({'type':'paragraph','children':[{'type':'text','value':marker}]});obj['downloadMarkdown']+='\n\n'+marker+'\n';obj['originalRawMarkdown']+='\n\n'+marker+'\n'
  changes.write(p,header+'NIFT_TANSTACK_DOCUMENT_V1\n'+json.dumps(obj,separators=(',',':'),ensure_ascii=False)+'\n')
 else:changes.write(p,text.replace('title: ',f'title: {marker} ',1) if metadata else text+'\n\n'+marker+'\n')
def mutate(name,workload,sample):
 project=base/'build-work' if name=='upstream' else base.parent/name
 changes=Changes();marker=f'Controlled publication benchmark {workload} sample {sample}'
 inv=json.loads((project/'sources/docs-inputs.json').read_text()) if name!='upstream' else None
 count=int(workload.split('-')[1]) if workload.startswith('body-') else 1
 entries=selected[:count]
 if workload.startswith('body-') or workload in {'metadata','docs-sync'}:
  for entry in entries:
   if name=='upstream':
    p=base/'external-inputs/docs'/('tanstack--query--main')/entry['file'];text=p.read_text();changes.write(p,text.replace('title: ',f'title: {marker} ',1) if workload=='metadata' else text+'\n\n'+marker+'\n')
   else:edit_document(changes,project,inv,entry,marker,workload=='metadata')
  if workload=='docs-sync' and name!='upstream':
   row=next(e for e in inv['files'] if e['repo']==entries[0]['repo'] and e['ref']==entries[0]['ref'] and e['file']==entries[0]['file'])
   maintained=(project/row['source']).read_text()
   raw=json.loads(maintained.split('NIFT_TANSTACK_DOCUMENT_V1\n',1)[1])['originalRawMarkdown'].encode() if name=='tanstack-agent' else maintained.encode()
   row['original_sha256']=hashlib.sha256(raw).hexdigest();row['original_git_blob']=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
   changes.write(project/'sources/docs-inputs.json',json.dumps(inv,indent=2)+'\n')
 elif workload=='navigation':
  p=(base/'external-inputs/docs/tanstack--query--main/docs/config.json') if name=='upstream' else project/'sources/docs/tanstack--query--main/docs/config.json'
  obj=json.loads(p.read_text());obj['sections'][0]['label']=marker;changes.write(p,json.dumps(obj,indent=2)+'\n')
 elif workload in {'shared-shell','island','collection'}:
  rel={'shared-shell':'src/components/Footer.tsx','island':'src/components/ThemeToggle.tsx','collection':'src/blog/announcing-tanstack-query-v5.md'}[workload]
  if workload=='collection':rel=str(sorted((project if name=='upstream' else project/'runtime').glob('src/blog/*.md'))[0].relative_to(project if name=='upstream' else project/'runtime'))
  p=(project if name=='upstream' else project/'runtime')/rel;text=p.read_text()
  if workload=='shared-shell':text=text.replace("label: 'Libraries'",f"label: 'Libraries {sample}'",1)
  elif workload=='island':text=text.replace('Switch to ${nextLabel} mode.',f'Switch to ${{nextLabel}} mode ({sample}).')
  else:text+='\n\n'+marker+'\n'
  changes.write(p,text)
 elif workload.startswith('route-'):
  entry=selected[0];newfile='docs/framework/react/benchmark-added.md'
  if name=='upstream':
   root=base/'external-inputs/docs/tanstack--query--main';original=root/entry['file'];new=root/newfile
   pins=json.loads((base/'docs-tree-inventory.json').read_text());pin=next(p for p in pins if p['repo']=='tanstack/query' and p['ref']=='main');treefile=base/pin['tree_file'];tree=json.loads(treefile.read_text())
   if workload in {'route-add','route-rename'}:
    changes.write(new,original.read_bytes());node=next(n.copy() for n in tree['tree'] if n['path']==entry['file']);node['path']=newfile;tree['tree'].append(node)
   if workload in {'route-rename','route-delete'}:changes.remove(original);tree['tree']=[n for n in tree['tree'] if n['path']!=entry['file']]
   changes.write(treefile,json.dumps(tree))
  else:
   row=next(e for e in inv['files'] if e['repo']==entry['repo'] and e['ref']==entry['ref'] and e['file']==entry['file'])
   if workload in {'route-add','route-rename'}:
    new=row.copy();new['file']=newfile;new['source']=row['source'].rsplit('/',1)[0]+'/benchmark-added'+('.document' if name=='tanstack-agent' else '.md');changes.write(project/new['source'],(project/row['source']).read_bytes());inv['files'].append(new)
   if workload in {'route-rename','route-delete'}:changes.remove(project/row['source']);inv['files'].remove(row)
   changes.write(project/'sources/docs-inputs.json',json.dumps(inv,indent=2)+'\n')
 return changes,count
if '--dry-mutations' in sys.argv:
 for workload in ['body-1','body-10','body-100','navigation','metadata','shared-shell','island','collection','docs-sync','route-add','route-rename','route-delete']:
  for name in ['upstream','tanstack','tanstack-agent']:
   changes,count=mutate(name,workload,1);changes.restore();print(name,workload,'mutation/restoration passed',flush=True)
 sys.exit(0)
subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/baseline/compile-native-refresh.mjs'],cwd=auth,check=True)
for workload in workloads:
 for name in ['upstream','tanstack','tanstack-agent']:
  cache=out/('native-r2-'+workload)
  if name=='upstream' and workload in native_cases:
   command=['python3','run-isolated.py','node','.native-benchmark/native-docs-refresh.mjs',str(cache),'prime','100',workload]
   with (out/(workload+'-prime.log')).open('w') as log:subprocess.run(command,cwd=base,stdout=log,stderr=subprocess.STDOUT,check=True)
  for sample in range(1,6):
   if any(r['workload']==workload and r['implementation']==name and r['sample']==sample for r in rows):continue
   publication_root=base/'build-work/dist' if name=='upstream' else base.parent/name/'publication'
   before=tree_hash(publication_root) if not(name=='upstream' and workload in native_cases) else None
   changes,count=mutate(name,workload,sample)
   try:
    if name=='upstream':
     cwd=base
     command=['python3','run-isolated.py','pnpm','build']
     scope='complete retained Vite production build'
     if workload in native_cases:
      command=['python3','run-isolated.py','node','.native-benchmark/native-docs-refresh.mjs',str(cache),'refresh',str(count),workload,selected[0]['file']];scope='native local R2 invalidation, changed-document reads and Query docs manifest refresh, including helper startup; no Vite rebuild or live edge purge'
     if workload=='fresh':
      for rel in ['dist','.content-collections','.tanstack','.wrangler']:
       import shutil;shutil.rmtree(base/'build-work'/rel,ignore_errors=True)
    else:
     cwd=base.parent/name;command=['python3','scripts/run-runtime.py','node','../scripts/publish.mjs']+(['--full'] if workload=='full' else ['--fresh'] if workload=='fresh' else []);scope='complete Nift documents/assets publication and required retained Vite build'
    key=f'{name}-{workload}-{sample}';row=measure(key,command,cwd)
    if before is not None:
     after=tree_hash(publication_root);row['publication_byte_fanout']={'added':len(after.keys()-before.keys()),'deleted':len(before.keys()-after.keys()),'changed':sum(before[k]!=after[k] for k in before.keys()&after.keys())}
    row.update(implementation=name,workload=workload,sample=sample,scope=scope)
    if name!='upstream':row['phases']=json.loads((cwd/'.rendered/pipeline-phases.json').read_text())
    rows.append(row);(out/'samples.json').write_text(json.dumps(rows,indent=2)+'\n');print(key,round(row['wall_seconds'],3),flush=True)
   finally:changes.restore()
  # Restore derived output/cache state before moving to a different workload.
  if name!='upstream':
   with (out/f'{name}-{workload}-restore.log').open('w') as log:subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/publish.mjs'],cwd=base.parent/name,stdout=log,stderr=subprocess.STDOUT,check=True)
summary=[]
if '--dry-mutations' in sys.argv:
 for workload in ['body-1','body-10','body-100','navigation','metadata','shared-shell','island','collection','docs-sync','route-add','route-rename','route-delete']:
  for name in ['upstream','tanstack','tanstack-agent']:
   changes,count=mutate(name,workload,1);changes.restore();print(name,workload,'mutation/restoration passed',flush=True)
 sys.exit(0)
subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/baseline/compile-native-refresh.mjs'],cwd=auth,check=True)
for workload in workloads:
 for name in ['upstream','tanstack','tanstack-agent']:
  group=[r for r in rows if r['workload']==workload and r['implementation']==name];assert len(group)==5
  result={'implementation':name,'workload':workload,'samples':5,'scope':group[0]['scope']}
  for key in ['wall_seconds','maximum_individual_process_rss_kib','sampled_descendant_tree_peak_rss_kib']:
   values=[r[key] for r in group];result[key]={'median':statistics.median(values),'min':min(values),'max':max(values)}
  summary.append(result)
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
