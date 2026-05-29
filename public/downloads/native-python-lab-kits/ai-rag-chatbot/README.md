# Native Python Lab Kit — Responsible RAG Chatbot

This lab is testable with **native Python**, **Postman**, **n8n**, and API evaluation logs.

## Run
```bash
python3 rag_policy_server.py
```
Open: http://127.0.0.1:8013/health

## Test with Postman
Import `postman_collection.json`, then run:
- Health check
- Ask supported question
- Ask unsupported/adversarial question
- View evaluation log

## Automate with n8n
Import `n8n_workflow.json`. It sends a question, checks citation/refusal behavior, and prepares a governance review record.

## Optional Wireshark/Postman evidence
Capture loopback traffic while Postman sends `/ask`. Use `wireshark_filters.txt` to show HTTP request/response evidence.

## Student mission
Students must demonstrate retrieval traceability, citation quality, refusal behavior, and hallucination-risk evaluation.


## Online Worker runtime

This material page auto-starts a Cloudflare Worker runtime when opened. To test without running local Python, import `postman_worker_collection.json` and call the public Worker endpoints. Native Python is still required when the class objective is local process execution or Wireshark loopback packet capture.
