"""Corrupt only owned generated state; require normal publication to repair accepted bytes."""
from pathlib import Path
import subprocess,json,hashlib,sys,time,os
project=Path(__file__).resolve().parent.parent;base=project.parent/'tanstack-baseline';out=Path(os.environ.get('TANSTACK_CACHE_CONTRACT_DIR',str(base/'t11-cache-contract6')));out.mkdir(exist_ok=True)
def publication(label,args=[]):
 with (out/(project.name+'-'+label+'.log')).open('w') as log:
  subprocess.run(['python3','scripts/run-runtime.py','node','../scripts/publish.mjs',*args],cwd=project,stdout=log,stderr=subprocess.STDOUT,check=True)
def files(root):return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
publication('prime');source_guard={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in (project/'scripts').glob('*') if p.is_file()};expected=files(project/'publication');(out/(project.name+'-expected.json')).write_text(json.dumps(expected));inv=json.loads((project/'sources/docs-inputs.json').read_text());entry=next(e for e in inv['files'] if e['repo']=='tanstack/query' and e['ref']=='main' and e['file']=='docs/framework/react/guides/background-fetching-indicators.md');slug='tanstack--query--main'
targets=[project/'.rendered/publish-corpus.mjs',project/'publication/client/_nift/docs/render'/slug/(entry['file']+'.txt'),project/'publication/client/_nift/docs/raw'/slug/(entry['file']+'.txt')]
if project.name=='tanstack':targets.extend([project/'.rendered/resolve-corpus.mjs',project/'.rendered/resolved'/slug/entry['file'],project/'.rendered/projections'/slug/(entry['file']+'.document')])
for p in targets:assert p.exists();p.write_bytes(b'Injected generated artifact corruption\n')
publication('repair-content');(out/(project.name+'-after-content.json')).write_text(json.dumps(files(project/'publication')));assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==sha for p,sha in source_guard.items()),'Concurrent producer edit invalidated this diagnostic';assert files(project/'publication')==expected,'Content corruption was not repaired'
# Bundle cache must cover more than index.js existence: a browser chunk byte corruption invalidates it.
chunk=next((project/'runtime/dist/client/assets').glob('*.js'));chunk.write_bytes(chunk.read_bytes()+b'\n// Injected bundle corruption\n')
publication('repair-bundle');assert json.loads((project/'.rendered/pipeline-phases.json').read_text())['runtime_rebuilt'];assert files(project/'publication')==expected,'Bundle corruption was not repaired'
# Cache metadata corruption must trigger safe recomputation, not trust stale output.
(project/'.rendered/publisher-compile.json').write_text('{invalid JSON')
publication('repair-state');assert files(project/'publication')==expected
state=project/'.rendered/publication-records.json';cached=json.loads(state.read_text());first=next(iter(cached['records'].values()));first['metadata']['redirect_from']=['/injected-cache-only-invalid-redirect'];state.write_text(json.dumps(cached));publication('repair-valid-json-state');assert files(project/'publication')==expected,'Valid JSON state corruption was accepted'
publication('force',['--full']);phases=json.loads((project/'.rendered/pipeline-phases.json').read_text());assert phases['force'] and phases['runtime_rebuilt'];assert files(project/'publication')==expected,'Forced vs incremental differs'
record={'model':project.name,'generated_artifacts_corrupted_and_repaired':len(targets),'browser_chunk_corruption_rebuild':True,'invalid_compile_cache_repaired':True,'valid_json_metadata_state_corruption_repaired':True,'forced_bypass':True,'incremental_force_byte_equal':True,'publication_files':len(expected),'scope':'generated cache/output only; maintained source never edited','timing':'diagnostic only, excluded from final benchmark'}
(out/(project.name+'.json')).write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
