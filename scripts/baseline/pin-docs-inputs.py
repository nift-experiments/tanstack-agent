import os
from pathlib import Path
import subprocess,json,concurrent.futures,datetime
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve();libs=json.loads((B/'library-inputs.json').read_text());pairs=set()
for l in libs:
 for version in l['availableVersions']:
  pairs.add((l['repo'],l['latestBranch'] if version==l['latestVersion'] else version))
def capture(pair):
 repo,ref=pair;r=subprocess.run(['gh','api','repos/'+repo+'/commits/'+ref],capture_output=True,text=True)
 if r.returncode:return {'repo':repo,'ref':ref,'resolved':False,'error':r.stderr.strip()[:250]}
 d=json.loads(r.stdout);return {'repo':repo,'ref':ref,'resolved':True,'commit':d['sha'],'commit_date':d['commit']['committer']['date']}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:records=list(pool.map(capture,sorted(pairs)))
(B/'docs-input-pins.json').write_text(json.dumps({'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_site_commit':(B/'upstream-sha.txt').read_text().strip(),'inputs':records},indent=2)+'\n');print('Pinned docs inputs:',sum(r['resolved'] for r in records),'/',len(records));print('Unresolved:',[r for r in records if not r['resolved']])
