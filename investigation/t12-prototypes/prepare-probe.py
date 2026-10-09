"""Create an isolated B clone. Does not change the accepted publisher."""
from pathlib import Path
import subprocess,sys
here=Path(__file__).resolve().parent
source=here.parents[1]
target=Path(sys.argv[1]).resolve()
if target.exists():raise SystemExit("Target must not exist")
subprocess.run(['git','clone','--no-hardlinks',str(source),str(target)],check=True)
recipe=(here/'measured-publish.mjs.txt').read_text()
old='/home/nick/Repositories/nift/nift-experiments/tanstack-baseline/t12-architecture/rsbuild-toolchain/'
recipe=recipe.replace(old,str(here/'rsbuild-toolchain')+'/')
(target/'scripts/publish.mjs').write_text(recipe)
print('Install runtime and sidecar frozen dependencies independently. Set TANSTACK_TOOLCHAIN. Provide target sibling tanstack-baseline/toolchain/nift-v4.9.0 for the retained publisher path.')
