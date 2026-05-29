#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import json, time, random
EVENTS=[]
class Handler(BaseHTTPRequestHandler):
    def _send(self,data,status=200):
        body=json.dumps(data,indent=2).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS'); self.send_header('Access-Control-Allow-Headers','Content-Type'); self.end_headers()
    def do_GET(self):
        p=urlparse(self.path).path
        if p=='/health': return self._send({'ok':True,'lab':'iot-protocol-simulator'})
        if p=='/metrics':
            lost=sum(1 for e in EVENTS if e.get('delivery')=='lost'); qos1=sum(1 for e in EVENTS if e.get('qos')==1)
            return self._send({'messages':len(EVENTS),'qos1_messages':qos1,'simulated_loss':lost,'events':EVENTS[-10:]})
        return self._send({'error':'not found'},404)
    def do_POST(self):
        p=urlparse(self.path).path; length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length) or b'{}')
        if p=='/publish':
            qos=int(payload.get('qos',0)); critical=bool(payload.get('critical',False)); delivery='acknowledged' if qos>0 or critical else random.choice(['delivered','lost'])
            event={'topic':payload.get('topic','farm/soil/moisture'),'value':payload.get('value',27),'qos':qos,'critical':critical,'delivery':delivery,'ts':time.time()}
            EVENTS.append(event); return self._send({'accepted':event},201)
        return self._send({'error':'not found'},404)
if __name__=='__main__':
    print('IoT protocol simulator: http://127.0.0.1:8012/metrics')
    HTTPServer(('127.0.0.1',8012),Handler).serve_forever()
