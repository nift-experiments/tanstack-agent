from pathlib import Path
import subprocess,hashlib,json
ROOT=Path(__file__).resolve().parents[3];tool=ROOT/'tanstack-baseline/toolchain/nift-v4.9.0'
for name in ['tanstack','tanstack-agent']:
 p=ROOT/name;source=p/'.rendered/projections/0.document' if name=='tanstack' else p/'sources/docs/tanstack--query--main/docs/framework/react/overview.document';original=source.read_bytes();out=p/'publication/client/_nift/docs/0.txt';marker='literal @input("missing.html") $[never] {{template}}';before={str(f.relative_to(p/'publication/client')):hashlib.sha256(f.read_bytes()).hexdigest() for f in (p/'publication/client').rglob('*') if f.is_file()}
 try:
  header,body=original.decode().split('NIFT_TANSTACK_DOCUMENT_V1\n',1);packet=json.loads(body);packet['document']['children'].append({'type':'code','value':marker,'lang':'text'});source.write_text(header+'NIFT_TANSTACK_DOCUMENT_V1\n'+json.dumps(packet)+'\n')
  run=subprocess.run([str(tool),'build'],cwd=p,text=True,capture_output=True,check=True);published=json.loads(out.read_text().split('NIFT_TANSTACK_DOCUMENT_V1\n',1)[1]);assert published['document']['children'][-1]['value']==marker
  after={str(f.relative_to(p/'publication/client')):hashlib.sha256(f.read_bytes()).hexdigest() for f in (p/'publication/client').rglob('*') if f.is_file()};changed=[k for k in before if before[k]!=after[k]];assert changed==['_nift/docs/0.txt'],changed
  receipt=dict(literal_preserved=True,explicit_dependency_correct=True,changed_outputs=changed,unchanged_files=len(before)-1,composition_only=True,stdout=run.stdout)
  (p/'investigation/t3-incremental-proof.json').write_text(json.dumps(receipt,indent=2)+'\n')
 finally:
  source.write_bytes(original);subprocess.run([str(tool),'build'],cwd=p,check=True,stdout=subprocess.DEVNULL)
 print(name+' raw dependency and literal proof passes')
