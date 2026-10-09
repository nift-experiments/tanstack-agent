import os
from pathlib import Path
import urllib.request,urllib.error,json,hashlib
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve()
class Manual(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(Manual)
cases=[('/',{}),('/query/latest/docs',{}),('/query/v5/docs/framework/react/overview.md',{}),('/query/latest/docs/framework/react/overview',{'Accept':'text/markdown'}),('/robots.txt',{}),('/missing-baseline-route',{}),('/api/auth/cli/status/unknown-fixture-ticket',{})]
out=[]
for route,headers in cases:
 try:r=opener.open(urllib.request.Request('http://localhost:4021'+route,headers=headers),timeout=60)
 except urllib.error.HTTPError as e:r=e
 body=r.read();out.append(dict(route=route,request_headers=headers,status=r.status,headers=dict(r.headers),bytes=len(body),sha256=hashlib.sha256(body).hexdigest()))
(B/'http-contract.json').write_text(json.dumps(out,indent=2))
print(json.dumps([(r['route'],r['status'],r['headers'].get('Location')) for r in out]))
