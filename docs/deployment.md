# Deployment

## Release architecture

This repository uses a GitHub-owned automated release path:

1. queued daily content lives in `automation/daily-content-queue/`
2. `.github/workflows/daily-content-pipeline.yml` publishes the next due article into `src/content/blog/`
3. the workflow reviews the generated package and allows only the expected blog/archive changes
4. the workflow runs content validation, link checks, and a production build
5. the workflow commits the approved package to `main`
6. the workflow deploys the freshly built `dist/` output to Cloudflare Pages

That means the website content is still updated from GitHub first, while the scheduled release job avoids a bot-created PR deadlock and deploys only after quality gates pass.

## Cloudflare Pages
- Project name: `lecturer-materials`
- Build command: `npm run build`
- Output directory: `dist`
- Deployment trigger: successful `CI` run on `main` for manual changes; direct deploy from `.github/workflows/daily-content-pipeline.yml` for scheduled content releases

## Cloudflare Worker
- Worker name: `lecturer-materials`
- Working directory: `worker/contact-form`
- Route: `https://lecturer-materials.hicall.workers.dev/api/contact` via workers.dev unless a custom route is configured
- Deployment trigger: successful `CI` run on `main`
- Built-in anti-spam protection: honeypot field, form timing validation, length limits, link-count screening, and blocked-term filtering
- Forwarding channels supported by the Worker:
  - `CONTACT_WEBHOOK_URL` secret for webhook forwarding
  - `RESEND_API_KEY` secret plus `CONTACT_EMAIL` and `RESEND_FROM_EMAIL` vars for email forwarding via Resend
  - `MAIL_FROM_EMAIL` plus a real `CONTACT_EMAIL` for MailChannels-based email fallback without a provider API key

### Worker secret setup
Production deploys now auto-sync these optional Worker secrets from GitHub Actions secrets during `.github/workflows/deploy-worker.yml`:

- `CONTACT_WEBHOOK_URL`
- `RESEND_API_KEY`

That means the recommended production setup is to store them as **repository secrets** in GitHub, then let the deploy workflow push them into the Worker automatically.

Manual fallback via the Cloudflare dashboard or Wrangler from `worker/contact-form/`:

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
