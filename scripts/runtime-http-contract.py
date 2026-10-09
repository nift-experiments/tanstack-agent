from pathlib import Path
import urllib.request,urllib.error,json,hashlib,os
root=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(Path(__file__).resolve().parents[2]/'tanstack-baseline')))
routes=['/api/auth/cli/status/unknown-fixture-ticket','/api/chat/projects','/api/chat/models','/api/chat/plugins','/api/chat/conversations','/api/chat/skills','/api/chat/references','/api/github/webhook','/api/example/deploy']
records=[]
for name,port in [('upstream',4021),('tanstack',4022),('tanstack-agent',4023)]:
 for route in routes:
  try:r=urllib.request.urlopen(f'http://localhost:{port}'+route,timeout=30)
  except urllib.error.HTTPError as e:r=e
  body=r.read();kind=r.headers.get('Content-Type','');record={'name':name,'route':route,'status':r.status,'content_type':kind}
  if 'text/html' not in kind:record['body_sha256']=hashlib.sha256(body).hexdigest()
  records.append(record)
for route in routes:
 group=[{k:v for k,v in r.items() if k!='name'} for r in records if r['route']==route]
 assert group[0]==group[1]==group[2],(route,group)
root.mkdir(parents=True,exist_ok=True)
(root/'t5-runtime-http.json').write_text(json.dumps({'states':len(records),'records':records,'scope':'Unauthenticated GET and method boundaries only; live authenticated services unverified','external_writes':False},indent=2)+'\n')
print(json.dumps(records))
