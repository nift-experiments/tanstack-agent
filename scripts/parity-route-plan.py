from pathlib import Path
import json,os
project=Path(__file__).resolve().parents[1];base=Path(os.environ.get('TANSTACK_BASELINE_DIR',str(project.parent/'tanstack-baseline')))
libraries=json.loads((base/'library-inputs.json').read_text());manifest=json.loads((project/'publication/client/_nift/docs-manifest.txt').read_text());routes=['/','/ethos','/brand-guide','/blog/announcing-tanstack-query-v5','/stats/npm','/chat','/charts/catalog/','/charts/catalog/charts/01-line-gaps/','/charts/catalog/collections/shadcn/']
for library in libraries:
 if not library['visible']:continue
 versions=['latest']
 if library['id']=='query':versions+=['v4','v3']
 if library['id']=='table':versions+=['v8']
 if library['id']=='form':versions+=['alpha']
 for version in versions:
  ref=library['latestBranch'] if version=='latest' else version
  key=f"{library['repo']}@{ref}:{library['docs_root']}"
  metadata=json.loads((project/'publication/client'/manifest['metadata'][key].lstrip('/')).read_text());paths=metadata['paths']
  candidates=[library.get('defaultDocs'),'framework/react/overview','overview','getting-started/overview','introduction']
  selected=next((x for x in candidates if x in paths),paths[0] if paths else None)
  if selected:routes.append(f"/{library['id']}/{version}/docs/{selected}")
routes+=['/query/latest/docs/framework/vue/overview','/query/latest/docs/framework/react/guides/queries','/start/latest/docs/framework/react/build-from-scratch','/start/latest/docs/framework/react/guide/hosting','/ai/latest/docs/adapters/acp-compatible','/not-a-real-page']
result={'routes':list(dict.fromkeys(routes)),'viewports':[1440,768,390],'implementations':['upstream','tanstack','tanstack-agent']}
(base/'t7-route-plan.json').write_text(json.dumps(result,indent=2)+'\n');print(len(result['routes']),result['routes'])
