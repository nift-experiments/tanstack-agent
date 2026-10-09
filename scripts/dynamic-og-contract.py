from pathlib import Path
import urllib.request,urllib.error,hashlib,json,os
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[2]/'tanstack-baseline')))
records=[]
for name,port in [('upstream',4021),('tanstack',4022),('tanstack-agent',4023)]:
 route='/api/og/query.png?title=Local%20fixture%20docs&description=Preserved%20dynamic%20OG%20service'
 try:r=urllib.request.urlopen(f'http://localhost:{port}'+route,timeout=60)
 except urllib.error.HTTPError as e:r=e
 body=r.read();records.append({'name':name,'status':r.status,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'content_type':r.headers.get('Content-Type')})
 (base/'t6-og').mkdir(parents=True,exist_ok=True);(base/'t6-og'/f'{name}.png').write_bytes(body)
assert all(r['status']==200 and r['content_type']=='image/png' for r in records),records
assert len({r['sha256'] for r in records})==1
result={'records':records,'scope':'Request-time generation remains retained; not part of routine publication'}
(base/'t6-dynamic-og.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
