# Deployment

## Release architecture

This repository now uses a review-gated GitHub-owned release path:

1. queued daily content lives in `automation/daily-content-queue/`
2. `.github/workflows/daily-content-pipeline.yml` publishes the next due article into `src/content/blog/`
3. the workflow opens an automated PR instead of pushing straight to `main`
4. `.github/workflows/review-daily-content-pr.yml` validates the package, posts an automated review, and merges it
5. `.github/workflows/ci.yml` validates the merged commit on `main`
6. successful CI triggers:
   - `.github/workflows/deploy-pages.yml`
   - `.github/workflows/deploy-worker.yml`

That means the website content is still updated from GitHub first, but now every scheduled content release has an auditable PR review gate before publication reaches `main`.

## Cloudflare Pages
- Project name: `lecturer-materials`
- Build command: `npm run build`
- Output directory: `dist`
- Deployment trigger: successful `CI` run on `main`

## Cloudflare Worker
- Worker name: `lecturer-materials`
- Working directory: `worker/contact-form`
- Route: `https://lecturer-materials.hicall.workers.dev/api/contact` via workers.dev unless a custom route is configured
- Deployment trigger: successful `CI` run on `main`
- Forwarding channels supported by the Worker:
  - `CONTACT_WEBHOOK_URL` secret for webhook forwarding
  - `RESEND_API_KEY` secret plus `CONTACT_EMAIL` and `RESEND_FROM_EMAIL` vars for email forwarding via Resend
  - `MAIL_FROM_EMAIL` plus a real `CONTACT_EMAIL` for MailChannels-based email fallback without a provider API key

### Worker secret setup
Use the Cloudflare dashboard or Wrangler from `worker/contact-form/`:

```bash
npx wrangler secret put CONTACT_WEBHOOK_URL
npx wrangler secret put RESEND_API_KEY
```

Non-secret vars live in `wrangler.toml` and local dev examples are documented in `worker/contact-form/.dev.vars.example`.

## Daily content automation
- Queue directory: `automation/daily-content-queue/`
- Publish script: `npm run content:daily`
- Review script: `node ./scripts/review-daily-content-pr.mjs`
- Schedule: `00:15 UTC` daily (`07:15 WIB`)

## Required GitHub secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
