import os
from pathlib import Path
import urllib.request,json,hashlib,datetime
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve();out=B/'external-inputs/blog';out.mkdir(parents=True,exist_ok=True);cursor=None;receipts=[]
for i in range(20):
 from urllib.parse import urlencode
 params={'repo':'did:plc:3nqrhu5mthmias3zc4a2ovzj','collection':'site.standard.document','limit':'100'}
 if cursor:params['cursor']=cursor
 url='https://eurosky.social/xrpc/com.atproto.repo.listRecords?'+urlencode(params)
 with urllib.request.urlopen(url,timeout=45) as r:body=r.read();status=r.status
 name=f'page-{i}.json';(out/name).write_bytes(body);data=json.loads(body);receipts.append(dict(url=url,file=name,status=status,sha256=hashlib.sha256(body).hexdigest(),records=len(data.get('records',[]))))
 cursor=data.get('cursor')
 if not cursor:break
(out/'receipts.json').write_text(json.dumps({'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':receipts,'terminal':not cursor},indent=2));print(json.dumps(receipts))
