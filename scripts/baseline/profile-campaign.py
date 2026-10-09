from pathlib import Path
import os,subprocess
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[3]/'tanstack-baseline'))).resolve()
out=base/'t8-profiles';out.mkdir(exist_ok=True)
jobs=[('tanstack','authored-resolve','../scripts/resolve-corpus.mts',[]),('tanstack','authored-derive','../scripts/derive-document-projection.mts',['--manifest','../.rendered/derive-corpus.json']),('tanstack','authored-publication','../scripts/publish-corpus.mts',[]),('tanstack-agent','agent-publication','../scripts/publish-corpus.mts',[])]
for name,label,script,args in jobs:
 with (out/(label+'.log')).open('w') as log:
  r=subprocess.run(['python3','scripts/run-runtime.py','node','--cpu-prof','--cpu-prof-dir='+str(out),'--cpu-prof-name='+label+'.cpuprofile','--import','tsx',script,*args],cwd=base.parent/name,stdout=log,stderr=subprocess.STDOUT)
 if r.returncode:raise RuntimeError(label+' failed')
 print(label+' captured',flush=True)
