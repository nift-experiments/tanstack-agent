from pathlib import Path
import os,subprocess,sys
project=Path(__file__).resolve().parent.parent
toolchain=Path(os.environ.get('TANSTACK_TOOLCHAIN', str(project.parent/'tanstack-baseline/toolchain')))
env={k:os.environ[k] for k in ['PATH','HOME','TMPDIR','LANG','LC_ALL','TERM'] if k in os.environ}
env['PATH']=str(toolchain/'node-v25.9.0-linux-x64/bin')+':'+str(toolchain/'pnpm/node_modules/.bin')+':'+env.get('PATH','')
env['NPM_CONFIG_USERCONFIG']=str(toolchain/'empty-npmrc')
env['WRANGLER_SEND_METRICS']='false'
for key in ['TANSTACK_BASELINE_DIR','TANSTACK_TOOLCHAIN']:
 if key in os.environ:env[key]=os.environ[key]
raise SystemExit(subprocess.run(sys.argv[1:],cwd=project/'runtime',env=env).returncode)
