# Protocol Delivery and Observability Module

## Audience
Learners studying Communication Protocol and infrastructure reliability.

## Teaching objective
Teach students to read CI/CD as a sequence of protocol-dependent interactions.

## Session structure
1. Identify protocols across source, build, deploy, and verify stages.
2. Map likely failure points for DNS, TLS, HTTP, and webhook callbacks.
3. Perform a health-check analysis using live deployment examples.
4. Build a protocol-aware troubleshooting worksheet.

## Example deployment checks
```yaml
- name: Deploy
  run: npx wrangler pages deploy dist --project-name=lecturer-materials
- name: Verify
  run: curl -L -A 'Mozilla/5.0' https://lecturer-materials.pages.dev/resources/
```

## Discussion prompts
- Which failure is transport-related versus application-related?
- Why does verification need a realistic user agent?
- Which signals would you monitor at the edge?
