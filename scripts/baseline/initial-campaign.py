"""Serialized preliminary publication samples. Final campaign uses five samples."""
import subprocess,time,json,os,sys
from pathlib import Path
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[3]/'tanstack-baseline'))).resolve()
corrected='--corrected-full' in sys.argv
out=base/('t8-corrected-full' if corrected else 't8-initial');out.mkdir(exist_ok=True)
rows=[]
for workload in (['full'] if corrected else ['full','unchanged']):
 for name in (['tanstack','tanstack-agent'] if corrected else ['upstream','tanstack','tanstack-agent']):
  cwd=base if name=='upstream' else base.parent/name
  command=['python3','run-isolated.py','pnpm','build'] if name=='upstream' else ['python3','scripts/run-runtime.py','node','../scripts/publish.mjs']+(['--full'] if workload=='full' else [])
  for sample in range(1,4):
   key=f'{name}-{workload}-{sample}';start=time.monotonic()
   with (out/(key+'.log')).open('w') as log:r=subprocess.run(['/usr/bin/time','-v','-o',str(out/(key+'.time')),*command],cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
   if r.returncode:raise RuntimeError(key+' failed; inspect log')
   timing=(out/(key+'.time')).read_text();rss=int(next(x.split(':',1)[1].strip() for x in timing.splitlines() if 'Maximum resident set size' in x))
   row={'implementation':name,'workload':workload,'sample':sample,'wall_seconds':time.monotonic()-start,'maximum_process_rss_kib':rss,'load_average':os.getloadavg()}
   if name!='upstream':row['phases']=json.loads((cwd/'.rendered/pipeline-phases.json').read_text())
   rows.append(row);(out/'samples.json').write_text(json.dumps(rows,indent=2)+'\n');print(key,round(row['wall_seconds'],3),rss,flush=True)
