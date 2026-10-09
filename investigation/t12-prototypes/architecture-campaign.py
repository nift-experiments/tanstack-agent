"""Five serialized samples per valid architecture using the faithful workload rules.
No rejected candidate timing is admitted. Both runtime environments and content
publication belong in the complete clock; there is no hidden backend build.
"""
from pathlib import Path
import time
import os,json,subprocess,statistics,shutil
arch=Path(__file__).resolve().parent
base=arch.parent
os.environ['TANSTACK_BASELINE_DIR']=str(base)
os.environ['TANSTACK_TOOLCHAIN']=str(base/'toolchain')
source=(base.parent/'tanstack/scripts/baseline/second-pass-campaign.py').read_text()
# Reuse the exact sampler, journal/restore, input selection and mutation semantics.
source=source.split("if '--dry-mutations' in sys.argv:",1)[0]
source=source.replace("out=base/'t11-final'","out=base/'t12-architecture-benchmark'")
source=source.replace("project=base/'build-work' if name=='upstream' else base.parent/name","project=base/'build-work' if name=='upstream' else projects[name]")
ns={'__file__':str(base.parent/'tanstack/scripts/baseline/second-pass-campaign.py')}
exec(compile(source,'faithful-workload-definitions','exec'),ns)
projects={'tanstack-agent':arch/'agent-publication-probe','faithful-agent':base.parent/'tanstack-agent'}
ns['projects']=dict(projects)
# The original agent-maintained packet mutation is used for both agent variants.
original_mutate=ns['mutate'];original_edit=ns['edit_document']
def mutate(name,workload,sample):
 ns['agent']=projects[name]
 return original_mutate(name,workload,sample)
ns['edit_document']=original_edit
out=ns['out'];rows=ns['rows']
workloads=['full','fresh','unchanged','body-1','shared-shell','island','route-rename','route-delete']
def attributed_measure(key,command,cwd):
 stamp=out/(key+'.time');logfile=out/(key+'.log');peak=0;count=0;phase='startup';phases={};processes={};started=time.monotonic();offset=0;pending=''
 with logfile.open('w')as log:
  process=subprocess.Popen(['/usr/bin/time','-v','-o',str(stamp),*command],cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
  while process.poll()is None:
   with logfile.open()as read:
    read.seek(offset);pending+=read.read();offset=read.tell()
   lines=pending.split('\n');pending=lines.pop()
   for line in lines:
    if line.startswith(('NIFT_PHASE ','RSBUILD_PHASE ')):phase=line.split(' ',1)[1]
   todo=[process.pid];seen=set();total=0
   while todo:
    pid=todo.pop()
    if pid in seen:continue
    seen.add(pid);rss,children=ns['proc'](pid);total+=rss;todo.extend(children)
    if rss:
     if pid not in processes:
      try:cmd=Path(f'/proc/{pid}/cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace')
      except FileNotFoundError:cmd='exited'
      processes[pid]={'command':cmd,'peak_rss_kib':0,'peak_phase':phase}
     if rss>processes[pid]['peak_rss_kib']:processes[pid].update(peak_rss_kib=rss,peak_phase=phase)
   peak=max(peak,total);phases[phase]=max(phases.get(phase,0),total);count+=1;time.sleep(.05)
  status=process.wait()
 if status:raise RuntimeError(key+' failed; inspect log')
 timing=stamp.read_text();rss=int(next(x.split(':',1)[1].strip()for x in timing.splitlines()if 'Maximum resident set size'in x));parts=next(x.rsplit(': ',1)[1].strip()for x in timing.splitlines()if 'Elapsed (wall clock)'in x).split(':');elapsed=sum(float(value)*60**i for i,value in enumerate(reversed(parts)))
 return {'wall_seconds':elapsed,'wrapper_wall_seconds':time.monotonic()-started,'maximum_individual_process_rss_kib':rss,'sampled_descendant_tree_peak_rss_kib':peak,'tree_sampling_interval_ms':50,'tree_samples':count,'load_average':os.getloadavg(),'sampled_phase_tree_peak_rss_kib':phases,'owned_processes':list(processes.values())}
ns['measure']=attributed_measure
for workload in workloads:
 for label,project in projects.items():
  # Keep original packet/lifecycle policy by presenting the same model name,
  # while selecting a distinct isolated project location.
  ns['projects']['tanstack-agent']=project
  for sample in range(1,6):
   if any(r['implementation']==label and r['workload']==workload and r['sample']==sample for r in rows):continue
   before=ns['tree_hash'](project/'publication')
   ns['agent']=project
   changes,count=original_mutate('tanstack-agent',workload,sample)
   try:
    command=['python3','scripts/run-runtime.py','node','../scripts/publish.mjs']+(['--full']if workload=='full'else ['--fresh']if workload=='fresh'else [])
    row=ns['measure'](f'{label}-{workload}-{sample}',command,project)
    after=ns['tree_hash'](project/'publication')
    fanout={'added':len(after.keys()-before.keys()),'deleted':len(before.keys()-after.keys()),'changed':sum(before[k]!=after[k]for k in before.keys()&after.keys())}
    if workload.startswith('route-'):assert fanout['deleted']>=3
    row.update(implementation=label,workload=workload,sample=sample,scope='complete agent content/assets/Worker configuration publication, including both required client and server bundling environments; no hidden service build',publication_byte_fanout=fanout,phases=json.loads((project/'.rendered/pipeline-phases.json').read_text()))
    rows.append(row);(out/'samples.json').write_text(json.dumps(rows,indent=2)+'\n');print(label,workload,sample,row['wall_seconds'],flush=True)
   finally:
    changes.restore()
    if workload.startswith('route-'):
     with (out/f'{label}-{workload}-{sample}-restore.log').open('w')as log:subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/publish.mjs'],cwd=project,stdout=log,stderr=subprocess.STDOUT,check=True)
  with (out/f'{label}-{workload}-restore.log').open('w')as log:subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/publish.mjs'],cwd=project,stdout=log,stderr=subprocess.STDOUT,check=True)
summary=[]
for workload in workloads:
 for label in ['tanstack-agent','faithful-agent']:
  group=[r for r in rows if r['workload']==workload and r['implementation']==label];assert len(group)==5
  result={'implementation':label,'workload':workload,'samples':5,'scope':group[0]['scope']}
  for key in ['wall_seconds','maximum_individual_process_rss_kib','sampled_descendant_tree_peak_rss_kib']:
   values=[r[key]for r in group];result[key]={'median':statistics.median(values),'min':min(values),'max':max(values)}
  summary.append(result)
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
