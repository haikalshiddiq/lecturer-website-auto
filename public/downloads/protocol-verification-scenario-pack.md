# Protocol Verification Scenario Pack

Use this pack to turn deployment verification into a Communication Protocol studio discussion. Each case maps a real CI/CD signal to the protocol layer that deserves investigation first.

## Studio sequence

1. Read the deployment symptom without jumping to conclusions.
2. Name the protocol boundary involved first.
3. Decide which evidence would confirm or reject the hypothesis.
4. Translate the finding into a safer GitHub Actions or Cloudflare verification step.

## Scenario cards

### 1. TLS handshake failure after deploy
- **Signal:** The final verification request returns `525 SSL handshake failed`.
- **First teaching question:** Which secure transport boundary is failing?
- **Expected reasoning:** DNS succeeded because the request reached the edge. The next investigation belongs to TLS negotiation rather than application logic.
- **Follow-up activity:** Ask students to write a verification checklist that separates DNS reachability, TLS success, and HTTP response validation.

### 2. Worker form works in curl but breaks in the browser
- **Signal:** JSON testing returns `200`, but the live contact form fails.
- **First teaching question:** Does the live client send the same payload format and headers?
- **Expected reasoning:** Browser forms commonly use `application/x-www-form-urlencoded` or `multipart/form-data`, so protocol-aware testing must match the real request shape.
- **Follow-up activity:** Compare form submissions and discuss why realistic request replay matters in edge verification.

### 3. Pages content appears updated for one user but stale for another
- **Signal:** One student sees the new landing page while another still sees older content.
- **First teaching question:** What does this suggest about caching or edge propagation?
- **Expected reasoning:** The protocol discussion should move toward HTTP caching behaviour, validation headers, and proof-string verification across clients.
- **Follow-up activity:** Ask students to design a GitHub Actions step that verifies a fresh proof string with a browser-like user agent.

## GitHub Actions teaching example

```yaml
- name: Verify Cloudflare Pages content with realistic client headers
  run: |
    HTML=$(curl -L -A 'Mozilla/5.0' https://lecturer-materials.pages.dev/expertise/communication-protocol)
    printf '%s' "$HTML" | grep -q "Interactive studio drill"
```

## Worker verification teaching example

```bash
curl -L https://lecturer-materials-worker.example.workers.dev/contact \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'name=Student&email=student@example.com&message=Protocol+check'
```

## Reflection prompts

- Which failures belong to transport, and which belong to application behavior?
- Why can a `200` response still hide a broken user experience?
- Which verification step should move from manual debugging into CI/CD guardrails?
