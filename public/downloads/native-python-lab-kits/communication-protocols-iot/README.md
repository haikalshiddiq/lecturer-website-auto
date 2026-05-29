# Native Python Lab Kit — IoT Protocol Reliability Simulator

This lab is testable with **native Python**, **Postman**, **n8n**, and **Wireshark**.

## Run API simulator
```bash
python3 iot_protocol_server.py
```
Open: http://127.0.0.1:8012/metrics

## Generate a Wireshark capture
```bash
python3 generate_iot_pcap.py
```
Then open `iot_protocol_lab.pcap` in Wireshark.

## Test with Postman
Import `postman_collection.json`, then run:
- Health check
- Publish sensor reading
- Publish critical alert
- Inspect protocol metrics

## Automate with n8n
Import `n8n_workflow.json`. It polls metrics and routes alerts based on loss/retry indicators.

## Student mission
Students compare HTTP API control traffic, MQTT-style telemetry evidence, TCP retransmission indicators, UDP trade-offs, and TLS visibility limits.


## Online Worker runtime

This material page auto-starts a Cloudflare Worker runtime when opened. To test without running local Python, import `postman_worker_collection.json` and call the public Worker endpoints. Native Python is still required when the class objective is local process execution or Wireshark loopback packet capture.
