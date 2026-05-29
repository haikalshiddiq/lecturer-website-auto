# Native Python Lab Kit — Incident Intelligence Dashboard

This lab is testable with **native Python**, **Postman**, **n8n**, and **Wireshark**.

## Run
```bash
python3 incident_dashboard_server.py
```
Open: http://127.0.0.1:8011/dashboard

## Test with Postman
Import `postman_collection.json`, then run:
- Health check
- Incident list
- KPI summary
- Add incident signal

## Automate with n8n
Import `n8n_workflow.json`. It calls the Python API, evaluates severity, and prepares an executive alert payload.

## Inspect with Wireshark
Start capture on loopback, run the Postman requests, then use filters from `wireshark_filters.txt`.

## Student mission
Students must prove that dashboard KPIs are generated from evidence, not from decorative assumptions.
