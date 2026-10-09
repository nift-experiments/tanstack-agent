import os
from pathlib import Path,PurePosixPath
import concurrent.futures,hashlib,json,subprocess,tarfile,urllib.request
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve();rows=json.loads((B/'docs-tree-inventory.json').read_text());D=B/'external-inputs/docs';A=B/'external-inputs/archives';D.mkdir(parents=True,exist_ok=True);A.mkdir(parents=True,exist_ok=True)
def capture(row):
 key=row['repo'].replace('/','--')+'--'+row['ref'];archive=A/(key+'.tar.gz');dest=D/key;dest.mkdir(exist_ok=True);expect={x['path']:x for x in row['docs_files']};url='https://codeload.github.com/'+row['repo']+'/tar.gz/'+row['commit']
 if not archive.exists():
  temp=archive.with_suffix('.partial');subprocess.run(['curl','-fSL','--retry','3','--max-time','240',url,'-o',str(temp)],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True);temp.rename(archive)
 captured=[]
 with tarfile.open(archive,'r:gz') as tar:
  for member in tar:
   parts=PurePosixPath(member.name).parts;path='/'.join(parts[1:])
   if path not in expect:continue
   assert member.isfile(),path;body=tar.extractfile(member).read();oid=hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest();assert oid==expect[path]['sha'],path
   target=dest/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(body);captured.append({'path':path,'git_blob':oid,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body)})
 assert set(x['path'] for x in captured)==set(expect),key
 return {'repo':row['repo'],'ref':row['ref'],'commit':row['commit'],'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':captured,'root':str(dest.relative_to(B))}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(capture,rows))
(B/'docs-body-capture.json').write_text(json.dumps(out,indent=2)+'\n');print('Verified',sum(len(r['files']) for r in out),'files against pinned Git blob IDs across',len(out),'versioned doc inputs')
