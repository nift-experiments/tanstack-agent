from pathlib import Path
import json,collections,os
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[3]/'tanstack-baseline')))
summary={}
for p in (base/'t8-profiles').glob('*.cpuprofile'):
 data=json.loads(p.read_text());nodes={n['id']:n['callFrame'] for n in data['nodes']};totals=collections.Counter()
 for node,delta in zip(data.get('samples',[]),data.get('timeDeltas',[])):
  f=nodes[node];totals[(f.get('functionName',''),f.get('url',''),f.get('lineNumber',-1))]+=delta
 summary[p.name]={'sampled_cpu_seconds':sum(totals.values())/1e6,'top_self_samples':[{'function':key[0],'url':key[1],'line':key[2]+1,'seconds':value/1e6} for key,value in totals.most_common(30)]}
(base/'t8-profiles/summary.json').write_text(json.dumps(summary,indent=2)+'\n')
for name,row in summary.items():print(name,row['sampled_cpu_seconds'],[(x['function'],round(x['seconds'],3)) for x in row['top_self_samples'][:8]])
