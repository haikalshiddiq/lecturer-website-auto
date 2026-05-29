#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import json, re, time
POLICIES=[
 {'id':'P01','area':'Attendance','text':'Students must satisfy minimum attendance requirements defined by the course policy.'},
 {'id':'P02','area':'Assessment','text':'Final grades combine assignments, midterm, final exam, and lecturer-approved participation.'},
 {'id':'P03','area':'Appeal','text':'Grade appeals require documented evidence and submission within the stated academic window.'},
 {'id':'P04','area':'Privacy','text':'Student academic data must not be exposed to unauthorized parties.'},
 {'id':'P05','area':'Scope','text':'The assistant cannot approve exceptions; it can only explain published policy and direct users to staff.'},
]
LOG=[]
def tokens(s): return set(re.findall(r'[a-z0-9]+', s.lower()))
def retrieve(q):
    qt=tokens(q); scored=[]
    for p in POLICIES:
        score=len(qt & tokens(p['text']+' '+p['area']))
        scored.append((score,p))
    return [p for score,p in sorted(scored, reverse=True, key=lambda x:x[0]) if score>0][:2]
def answer(q):
    hits=retrieve(q)
    risky=any(w in q.lower() for w in ['approve','exception','change my grade','private data','password'])
    if not hits or risky:
        return {'answer':'I cannot answer or approve this from the provided policy sources. Please contact authorized academic staff.','sources':[h['id'] for h in hits],'refusal':True,'faithfulness':'safe_refusal'}
    text=' '.join(h['text'] for h in hits)
    return {'answer': text + ' Sources: ' + ', '.join(h['id'] for h in hits), 'sources':[h['id'] for h in hits], 'refusal':False, 'faithfulness':'grounded_in_retrieved_sources'}
class Handler(BaseHTTPRequestHandler):
    def _send(self,data,status=200):
        body=json.dumps(data,indent=2).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS'); self.send_header('Access-Control-Allow-Headers','Content-Type'); self.end_headers()
    def do_GET(self):
        p=urlparse(self.path).path
        if p=='/health': return self._send({'ok':True,'lab':'responsible-rag'})
        if p=='/sources': return self._send({'policies':POLICIES})
        if p=='/eval-log': return self._send({'log':LOG})
        return self._send({'error':'not found'},404)
    def do_POST(self):
        if urlparse(self.path).path!='/ask': return self._send({'error':'not found'},404)
        length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length) or b'{}'); q=payload.get('question','')
        result=answer(q); result['question']=q; result['ts']=time.time(); LOG.append(result); self._send(result)
if __name__=='__main__':
    print('Responsible RAG server: http://127.0.0.1:8013/health')
    HTTPServer(('127.0.0.1',8013),Handler).serve_forever()
