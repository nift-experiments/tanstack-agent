"""Recreate owned local fixtures from committed bytes and immutable public pins.
Acquisition is outside publication timing. Never call private providers or write upstream.
"""
from pathlib import Path
import argparse,json,hashlib,urllib.request,tarfile
parser=argparse.ArgumentParser();parser.add_argument('--baseline',type=Path,required=True);parser.add_argument('--authored-source',type=Path,required=True);args=parser.parse_args()
base=args.baseline.resolve();author=args.authored_source.resolve();fixtures=author/'evidence/fixtures';base.mkdir(parents=True,exist_ok=True)
def digest(body):return hashlib.sha256(body).hexdigest()
def write(file,body):
 if file.exists() and file.read_bytes()!=body:raise RuntimeError('Refuse to overwrite a different owned fixture: '+str(file))
 file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(body)
for file in ['fixture-provider.mjs','run-isolated.py']:
 write(base/file,(author/'scripts/baseline'/file).read_bytes())
index=json.loads((fixtures/'index.json').read_text())
for row in index['files']:
 p=fixtures/row['file'];body=p.read_bytes();assert len(body)==row['bytes'] and digest(body)==row['sha256'],row['file']
 rel=Path(row['file']);target=base/'external-inputs'/rel if rel.parts[0] in ['blog','esm','docs-trees'] else base/rel;write(target,body)
inv=json.loads((author/'sources/docs-inputs.json').read_text())
for row in inv['files']:
 body=(author/row['source']).read_bytes();assert digest(body)==row['original_sha256'],row['source'];write(base/'external-inputs/docs'/(row['repo'].replace('/','--')+'--'+row['ref'])/row['file'],body)
receipts=[json.loads((base/f).read_text()) for f in ['catalog-input-capture.json','catalog-runtime-extra-inputs.json']];commit=receipts[0]['commit'];assert all(r['commit']==commit for r in receipts)
wanted={r['path']:r for receipt in receipts for r in receipt['files']};root=base/'external-inputs/catalog/tanstack--charts--main'
missing=[name for name,row in wanted.items() if not(root/name).exists()]
if missing:
 archive=base/'external-inputs/archives'/('tanstack--charts--'+commit+'.tar.gz');archive.parent.mkdir(parents=True,exist_ok=True)
 if not archive.exists():
  with urllib.request.urlopen('https://codeload.github.com/TanStack/charts/tar.gz/'+commit,timeout=120) as response:write(archive,response.read())
 with tarfile.open(archive) as tar:
  for member in tar:
   if not member.isfile() or '/' not in member.name:continue
   name=member.name.split('/',1)[1]
   if name not in wanted:continue
   body=tar.extractfile(member).read();row=wanted[name];assert len(body)==row['bytes'] and digest(body)==row['sha256'],name
   assert hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest()==row['git_blob'],name;write(root/name,body)
for name,row in wanted.items():assert digest((root/name).read_bytes())==row['sha256'],name
print(json.dumps({'docs':len(inv['files']),'catalog_files':len(wanted),'fixtures':len(index['files']),'public_pinned_GET_only':True,'baseline':str(base)}))
