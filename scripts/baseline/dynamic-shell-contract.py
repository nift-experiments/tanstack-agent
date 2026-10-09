from pathlib import Path
import urllib.request,urllib.error,re,json,hashlib
B=Path(__file__).resolve().parents[3]/"tanstack-baseline"
class Manual(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(Manual);records=[];reference=None
for name,port in [('upstream',4021),('tanstack',4022),('tanstack-agent',4023)]:
 seeds=[]
 for _ in range(2):
  with opener.open(f'http://localhost:{port}/ethos') as r:body=r.read().decode();assert r.status==200
  seed=re.search(r'partnerPlacementSessionSeed:"([^"]+)"',body);assert seed;seeds.append(seed.group(1))
 assert seeds[0]!=seeds[1],('session rotation frozen',name)
 with opener.open(urllib.request.Request(f'http://localhost:{port}/query/latest/docs/framework/react/overview',headers={'Accept':'text/markdown'})) as r:md=r.read();assert r.status==200
 if reference is None:reference=md
 else:assert md==reference,('Markdown negotiation changed',name)
 records.append(dict(name=name,fresh_partner_session_seed=True,markdown_sha256=hashlib.sha256(md).hexdigest(),markdown_bytes=len(md)))
(B/'dynamic-shell-contract.json').write_text(json.dumps(records,indent=2));print(json.dumps(records))
