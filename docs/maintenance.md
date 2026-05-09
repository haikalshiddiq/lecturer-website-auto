# Daily Maintenance and Content Automation

The repository has **two separate recurring automation tracks** plus local verification commands for manual changes.

## 1. Daily content publication
Workflow: `.github/workflows/daily-content-pipeline.yml`

Purpose:
1. publish the next due article from `automation/daily-content-queue/`
2. validate content integrity and balanced topic coverage
3. check links and build the site
4. commit and push the approved package to `main`
5. deploy the freshly built `dist/` output to Cloudflare Pages

Use this for safe, pre-authored website growth.

## 2. Daily maintenance review
Workflow: `.github/workflows/daily-maintenance.yml`

Purpose:
1. inspect repository state and workflow health
2. verify build stability
3. review queue status and content coverage
4. generate a maintenance report
5. document meaningful findings for future improvement

## Local maintenance checks
Run these before pushing code, content, or documentation changes:

```bash
npm run validate:content
npm run check:links
npm run build
```

After a deployment reaches Cloudflare, run:

```bash
npm run smoke:live
```

The live smoke check verifies expected deployed content on Cloudflare Pages and checks the Worker contact endpoint with CORS preflight plus a deliberately invalid POST validation request. It does not require secrets and does not forward a real inquiry.

## Refactored architecture checkpoints
Maintenance reviews should watch these layers:
- `src/lib/content.ts` — shared collection sorting, slug normalization, and topic coverage helpers.
- `src/components/ui` — visual primitives used by larger sections.
- `src/data` — durable site/profile/home configuration.
- `scripts/validate-content.mjs` — content structure and topic coverage validation.
- `scripts/smoke-check-live.mjs` — post-deploy live verification.
- `automation/daily-content-queue/` — future scheduled content supply.

## Release discipline
- Non-trivial code or architecture changes should still use branch + PR discipline when a human review gate is desired.
- Scheduled content publication can go directly to `main` because it comes from a reviewed queue stored in GitHub and passes validation before deployment.
- Cloudflare deployment should happen only after successful validation/build gates.
- Do not treat a Worker acknowledgement as proof of email delivery; forwarding still depends on configured webhook/email provider secrets or a verified sender path.

## Healthy maintenance outcome
A healthy report should confirm:
- GitHub Actions are passing.
- Content coverage remains balanced across all three teaching pillars.
- Daily content queue has upcoming items.
- Build/link checks are green.
- Live Pages content and Worker validation behavior pass smoke checks.
- Any contact forwarding limitations are clearly documented.
