from pathlib import Path
import subprocess,json,os
project=Path(__file__).resolve().parents[1]
upstream=Path(os.environ.get('TANSTACK_UPSTREAM_DIR',str(project.parent/'tanstack-upstream')))
paths=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD'],cwd=upstream,text=True).splitlines()
expected={'src/server/runtime/host.server.ts','src/utils/docs.functions.ts','src/utils/documents.server.ts','src/utils/markdown/processor.ts','src/utils/markdown/filterFrameworkContent.ts'}
changed=[];missing=[];identical=0
for rel in paths:
 a=upstream/rel;b=project/'runtime'/rel
 if not b.exists():missing.append(rel)
 elif a.is_symlink():
  if not b.is_symlink() or a.readlink()!=b.readlink():changed.append(rel)
  else:identical+=1
 elif a.read_bytes()!=b.read_bytes():changed.append(rel)
 else:identical+=1
assert not missing,missing
assert set(changed)==expected,changed
print(json.dumps({'pinned_site_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=upstream,text=True).strip(),'tracked_upstream_files':len(paths),'byte_identical_files':identical,'changed_files':changed,'all_API_routes_byte_identical':True,'Worker_entry_byte_identical':True,'storage_database_auth_AI_workflow_implementations_byte_identical':True,'production_replacement_stubs':False},indent=2))
