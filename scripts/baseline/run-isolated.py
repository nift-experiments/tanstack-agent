from pathlib import Path
import os,subprocess,sys
B=Path(os.environ.get("TANSTACK_BASELINE_DIR", str(Path(__file__).resolve().parents[3]/"tanstack-baseline"))).resolve()
allowed=['PATH','HOME','TMPDIR','LANG','LC_ALL','TERM','SYSTEMROOT']
env={k:os.environ[k] for k in allowed if k in os.environ}
env['PATH']=str(B/'toolchain/node-v25.9.0-linux-x64/bin')+':'+str(B/'toolchain/pnpm/node_modules/.bin')+':'+env.get('PATH','')
env['NPM_CONFIG_USERCONFIG']=str(B/'toolchain/empty-npmrc')
env['WRANGLER_SEND_METRICS']='false'
env['XDG_CONFIG_HOME']=str(B/'toolchain/isolated-config')
Path(env['XDG_CONFIG_HOME']).mkdir(parents=True,exist_ok=True)
(B/'toolchain/empty-npmrc').touch()
raise SystemExit(subprocess.run(sys.argv[1:],cwd=B/'build-work',env=env).returncode)
