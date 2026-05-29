#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import json, time

INCIDENTS = [
    {"id":"E01","service":"Citizen portal","signal":"Authentication latency above baseline","severity":4,"confidence":0.88,"owner":"Identity team","action":"Check identity dependency and session store"},
    {"id":"E02","service":"Immigration","signal":"Public report of service disruption","severity":5,"confidence":0.63,"owner":"Immigration service owner","action":"Verify internally before public statement"},
    {"id":"E03","service":"Core infrastructure","signal":"Backup restore estimate changed twice","severity":5,"confidence":0.41,"owner":"Infrastructure recovery lead","action":"Escalate uncertainty and request recovery evidence"},
]

class Handler(BaseHTTPRequestHandler):
    def _send(self, data, status=200, content_type='application/json'):
        body = data if isinstance(data, bytes) else json.dumps(data, indent=2).encode()
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS'); self.send_header('Access-Control-Allow-Headers','Content-Type'); self.end_headers()
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/health': return self._send({'ok': True, 'lab':'ism-incident-dashboard'})
        if path == '/api/incidents': return self._send({'incidents': INCIDENTS})
        if path == '/api/kpis':
            high = [x for x in INCIDENTS if x['severity'] >= 4]
            weak = [x for x in INCIDENTS if x['confidence'] < .6]
            return self._send({'total_signals':len(INCIDENTS),'high_severity':len(high),'weak_evidence':len(weak),'decision_needed':[x['action'] for x in high]})
        if path == '/dashboard':
            html = """<!doctype html><title>Incident Dashboard</title><h1>AI Incident Intelligence Dashboard</h1><p>Native Python dashboard API is running.</p><ul>""" + ''.join(f"<li>{i['service']}: severity {i['severity']} / confidence {i['confidence']}</li>" for i in INCIDENTS) + "</ul>"
            return self._send(html.encode(), content_type='text/html')
        return self._send({'error':'not found'},404)
    def do_POST(self):
        if urlparse(self.path).path != '/api/incidents': return self._send({'error':'not found'},404)
        length = int(self.headers.get('Content-Length','0')); payload = json.loads(self.rfile.read(length) or b'{}')
        item = {'id':payload.get('id',f'E{len(INCIDENTS)+1:02d}'),'service':payload.get('service','Unknown'),'signal':payload.get('signal','Manual signal'),'severity':int(payload.get('severity',3)),'confidence':float(payload.get('confidence',0.5)),'owner':payload.get('owner','Triage team'),'action':payload.get('action','Review signal')}
        INCIDENTS.append(item); self._send({'created':item},201)

if __name__ == '__main__':
    print('Incident dashboard lab: http://127.0.0.1:8011/dashboard')
    HTTPServer(('127.0.0.1',8011), Handler).serve_forever()
