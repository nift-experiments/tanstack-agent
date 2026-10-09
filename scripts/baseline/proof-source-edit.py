from pathlib import Path
import json,subprocess,time,os,signal
ROOT=Path(__file__).resolve().parents[3];BASE=ROOT/'tanstack-baseline';marker='T3 maintained-source edit @input("literal") $[literal] {{template}}'
for name,port in [('tanstack',4062),('tanstack-agent',4063)]:
 project=ROOT/name;agent=name.endswith('-agent');source=project/'sources/docs/tanstack--query--main/docs/framework/react'/('overview.document' if agent else 'overview.md');original=source.read_bytes();server=None
 try:
  if agent:
   header,body=original.decode().split('NIFT_TANSTACK_DOCUMENT_V1\n',1);packet=json.loads(body);packet['document']['children'].append({'type':'code','value':marker,'lang':'text'});packet['downloadMarkdown']+='\n```text\n'+marker+'\n```\n';source.write_text(header+'NIFT_TANSTACK_DOCUMENT_V1\n'+json.dumps(packet)+'\n')
  else:source.write_bytes(original+('\n```text\n'+marker+'\n```\n').encode())
  runner=['python3',str(project/'scripts/run-runtime.py')]
  with (BASE/(name+'-source-edit-compose.log')).open('w') as log:subprocess.run(runner+['node','../scripts/proof-compose.mjs'],stdout=log,stderr=subprocess.STDOUT,check=True)
  logpath=BASE/(name+'-source-edit-server.log');log=logpath.open('w');server=subprocess.Popen(runner+['node','../scripts/proof-server.mjs',str(port)],stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  for _ in range(120):
   if server.poll() is not None:raise RuntimeError('Proof server exited')
   if 'PROOF_READY' in logpath.read_text():break
   time.sleep(.25)
  else:raise RuntimeError('Proof server readiness timeout')
  with (BASE/(name+'-source-edit-browser.log')).open('w') as output:subprocess.run(runner+['node','../scripts/proof-browser.mjs',f'http://localhost:{port}',marker],stdout=output,stderr=subprocess.STDOUT,check=True)
  print(name+' source edit passes',flush=True)
 finally:
  if server is not None:os.killpg(server.pid,signal.SIGTERM) if server.poll() is None else None;server.wait(timeout=20);log.close()
  source.write_bytes(original)
  with (BASE/(name+'-source-restore-compose.log')).open('w') as output:subprocess.run(['python3',str(project/'scripts/run-runtime.py'),'node','../scripts/proof-compose.mjs'],stdout=output,stderr=subprocess.STDOUT,check=True)
