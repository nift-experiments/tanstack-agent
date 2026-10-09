from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import threading,urllib.request,re,json,hashlib
page=Path('static-backend-probe/publication/ethos.html').read_bytes()
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  if self.path=='/ethos':body=page;status=200;ctype='text/html'
  else:
   with urllib.request.urlopen('http://localhost:4023'+self.path) as response:body=response.read();status=response.status;ctype=response.headers.get('Content-Type','application/octet-stream')
  self.send_response(status);self.send_header('Content-Type',ctype);self.end_headers();self.wfile.write(body)
server=ThreadingHTTPServer(('127.0.0.1',4024),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
def seeds(port):
 result=[]
 for _ in range(2):
  with urllib.request.urlopen(f'http://localhost:{port}/ethos') as response:body=response.read().decode()
  result.append(re.search(r'partnerPlacementSessionSeed:"([^"]+)"',body).group(1))
 return result
try:
 original=seeds(4023);static=seeds(4024)
 assert original[0]!=original[1]
 assert static[0]==static[1]
 with urllib.request.urlopen('http://localhost:4024/query/latest/docs/framework/react/overview',timeout=30) as r:assert r.status==200
 receipt={'prototype':'C Nift-maintained HTML with real separately running backend','nift_composed_html_sha256':hashlib.sha256(page).hexdigest(),'backend_retained_and_forwarding_live':True,'backend_fresh_request_seed':True,'static_request_seed_frozen':True,'status':'rejected-parity-loss','timings_eligible':False,'next_boundary_requirement':'Request-specific HTML/serialized loader context and partner placement must remain dynamically rendered; a static snapshot plus existing backend does not satisfy the accepted request contract.'}
 Path('static-backend-probe/result.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
finally:server.shutdown();server.server_close()
