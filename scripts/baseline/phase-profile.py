"""Diagnostic only: sampled owned descendants, phase/PID attribution; not final benchmark."""
from pathlib import Path
import subprocess,time,json,os,sys,collections
base=Path(__file__).resolve().parents[3]/'tanstack-baseline';out=Path(os.environ.get('TANSTACK_PROFILE_DIR',str(base/'t11-profile')));out.mkdir(exist_ok=True)
if (out/(sys.argv[1]+'-'+sys.argv[2]+'.json')).exists():raise RuntimeError('Refuse to overwrite diagnostic evidence; select a new TANSTACK_PROFILE_DIR')
name=sys.argv[1];case=sys.argv[2];project=base.parent/name
cmd=['python3','scripts/run-runtime.py','node','../scripts/publish.mjs']+(['--full'] if case=='full' else [])
if case=='bundle-environments' or case.startswith('bundle-heap-'):
 config=project/'.rendered/profile-vite.config.mts'
 config.write_text("import original from '../runtime/vite.config.ts'; export default async (params)=>{const c=await original(params); return {...c,plugins:[...c.plugins,{name:'diagnostic-phase-only',configResolved(){const t=setInterval(()=>console.log('VITE_MEMORY '+JSON.stringify({time:performance.now(),...process.memoryUsage()})),200);t.unref()},buildStart(){console.log('VITE_PHASE '+this.environment.name+'_transform')},renderStart(){console.log('VITE_PHASE '+this.environment.name+'_emit')},closeBundle(){console.log('VITE_PHASE '+this.environment.name+'_complete')}}]}};\n")
 cmd=['python3','scripts/run-runtime.py','pnpm','exec','vite','build','--config','../.rendered/profile-vite.config.mts','--logLevel','warn']
if case.startswith('workers-'):cmd=['python3','scripts/run-runtime.py','node','../scripts/derive-parallel.mjs',case.split('-')[1]]
if case.startswith('bundle-heap-'):
 launcher=project/'.rendered/profile-heap.mjs'
 launcher.write_text("import {spawnSync} from 'node:child_process';const result=spawnSync('pnpm',['exec','vite','build','--config','../.rendered/profile-vite.config.mts','--logLevel','warn'],{stdio:'inherit',env:{...process.env,NODE_OPTIONS:'--max-old-space-size='+process.argv[2]}});process.exit(result.status??1);\n")
 cmd=['python3','scripts/run-runtime.py','node','../.rendered/profile-heap.mjs',case.split('-')[-1]]
logfile=out/(name+'-'+case+'.log');rows=[];processes={};phase='startup';cursor=0;begin=time.monotonic()
with logfile.open('w') as log:
 p=subprocess.Popen(cmd,cwd=project,stdout=log,stderr=subprocess.STDOUT)
 with logfile.open() as stream:
  while p.poll() is None:
   for line in stream:
    if line.startswith('NIFT_PHASE '):phase=line.strip().split(' ',1)[1]
    elif line.startswith('VITE_PHASE '):phase=line.strip().split(' ',1)[1]
   todo=[p.pid];seen=set();rsssum=0;now=time.monotonic()-begin
   while todo:
    pid=todo.pop()
    if pid in seen:continue
    seen.add(pid)
    try:
     proc=Path('/proc')/str(pid);status=proc.joinpath('status').read_text();rss=int(next(x.split()[1] for x in status.splitlines() if x.startswith('VmRSS:')));rsssum+=rss
     identity=(pid,proc.joinpath('stat').read_text().rsplit(')',1)[1].split()[19]);key=str(identity)
     record=processes.setdefault(key,{'pid':pid,'command':proc.joinpath('cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace'),'first_seconds':now,'last_seconds':now,'peak_rss_kib':0,'phase_peaks':{}});record['last_seconds']=now;record['peak_rss_kib']=max(record['peak_rss_kib'],rss);record['phase_peaks'][phase]=max(record['phase_peaks'].get(phase,0),rss)
     for task in proc.joinpath('task').iterdir():
      try:todo.extend(map(int,task.joinpath('children').read_text().split()))
      except (FileNotFoundError,ProcessLookupError):pass
    except (FileNotFoundError,ProcessLookupError,StopIteration,PermissionError):pass
   rows.append({'seconds':now,'phase':phase,'tree_rss_kib':rsssum});time.sleep(.05)
 status=p.wait()
phases={}
for row in rows:
 r=phases.setdefault(row['phase'],{'sampled_seconds':0,'tree_peak_rss_kib':0});r['sampled_seconds']+=.05;r['tree_peak_rss_kib']=max(r['tree_peak_rss_kib'],row['tree_rss_kib'])
result={'model':name,'case':case,'diagnostic_only':True,'exit_code':status,'wall_seconds':time.monotonic()-begin,'interval_ms':50,'phases':phases,'processes':list(processes.values()),'samples':rows}
(out/(name+'-'+case+'.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['samples','processes']}));raise SystemExit(status)
