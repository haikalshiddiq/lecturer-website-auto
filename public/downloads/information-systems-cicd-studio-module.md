# Information Systems CI/CD Studio Module

## Audience
Advanced undergraduate or postgraduate learners in Information System Management.

## Teaching objective
Help learners understand CI/CD as a governance system for controlled change, service continuity, and institutional accountability.

## Session structure
1. Strategic framing: why release discipline matters in campus systems.
2. Workflow reading: GitHub branch, PR, quality checks, deployment, verification.
3. Group activity: write a CI/CD policy for a student-facing service.
4. Reflection: define KPI signals for trustworthy release.

## Example GitHub Actions workflow
```yaml
name: quality
on:
  pull_request:
  push:
    branches: [main]
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run validate:content
```

## Discussion prompts
- Which control is technical and which is managerial?
- What is the cost of bypassing release review?
- Which KPI best signals stable service change?
