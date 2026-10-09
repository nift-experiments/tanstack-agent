from pathlib import Path
import tarfile,json,hashlib,os
b=Path(os.environ.get('TANSTACK_BASELINE_DIR', str(Path(__file__).resolve().parents[3]/'tanstack-baseline')));row=next(r for r in json.loads((b/'docs-tree-inventory.json').read_text()) if r['repo']=='tanstack/charts' and r['ref']=='main');tree={r['path']:r for r in json.loads((b/row['tree_file']).read_text())['tree']};root=b/'external-inputs/catalog/tanstack--charts--main';files=[]
with tarfile.open(b/'external-inputs/archives/tanstack--charts--main.tar.gz') as tar:
 for member in tar:
  if not member.isfile():continue
  relative=member.name.split('/',1)[1]
  if not relative.startswith('benchmarks/conformance/'):continue
  body=tar.extractfile(member).read();oid=hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest();assert tree[relative]['sha']==oid,relative
  target=root/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(body);files.append({'path':relative,'bytes':len(body),'git_blob':oid,'sha256':hashlib.sha256(body).hexdigest()})
receipt={'repo':row['repo'],'commit':row['commit'],'files':files,'total_bytes':sum(f['bytes'] for f in files),'case_count':len(json.loads((root/'benchmarks/conformance/catalog-index.json').read_text())['cases']),'role':'retained runtime catalog fixture; not migrated Markdown input'}
(b/'catalog-input-capture.json').write_text(json.dumps(receipt,indent=2)+'\n');print(len(files),receipt['total_bytes'],receipt['case_count'])
