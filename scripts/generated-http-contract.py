from pathlib import Path
import urllib.request,urllib.error,json,hashlib,os
base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[2]/'tanstack-baseline')))
routes=['/robots.txt','/llms.txt','/llms-full.txt','/builder/llms.txt','/query/latest/llms.txt','/query/v4/llms.txt','/router/latest/llms.txt','/start/latest/llms.txt','/ai/latest/llms.txt','/sitemap.xml']
records=[]
for name,port in [('upstream',4021),('tanstack',4022),('tanstack-agent',4023)]:
 for route in routes:
  try:r=urllib.request.urlopen(f'http://localhost:{port}'+route,timeout=180)
  except urllib.error.HTTPError as e:r=e
  body=r.read();record={'name':name,'route':route,'status':r.status,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'content_type':r.headers.get('Content-Type'),'cache_control':r.headers.get('Cache-Control'),'cdn_cache_control':r.headers.get('Cloudflare-CDN-Cache-Control')};records.append(record)
  (base/'t6-generated').mkdir(parents=True,exist_ok=True);(base/'t6-generated'/f'{name}-{route.strip("/").replace("/","--")}').write_bytes(body)
  print(name,route,r.status,len(body),flush=True)
for route in routes:
 group=[{k:v for k,v in r.items() if k!='name'} for r in records if r['route']==route];assert group[0]==group[1]==group[2],(route,group)
(base/'t6-generated-http.json').write_text(json.dumps({'states':len(records),'records':records},indent=2)+'\n')
print('Generated/robot/sitemap/LLM bytes and cache headers match.')
