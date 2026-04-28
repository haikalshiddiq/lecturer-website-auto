# Haikal Shiddiq Lecturer Website

A premium, Cloudflare-ready lecturer website built with Astro and Tailwind CSS for Haikal Shiddiq S.Kom., M.T. The project is optimized for responsive presentation, content scalability, fast global delivery, and ongoing GitHub-based maintenance.

## Stack
- Astro
- Tailwind CSS
- Cloudflare Pages
- Cloudflare Worker for contact handling, webhook/email forwarding, and edge deployment continuity
- GitHub Actions CI/CD

## Local development
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
```

## Daily content publication
This repository now has a real repo-native daily content pipeline with an automated PR review gate.

### How it works
1. prepare queued articles in `automation/daily-content-queue/`
2. GitHub Actions runs `.github/workflows/daily-content-pipeline.yml` every day
3. the workflow publishes the next due article into `src/content/blog/`
4. the workflow opens an automated PR instead of pushing directly to `main`
5. `.github/workflows/review-daily-content-pr.yml` validates and merges the PR
6. `CI` validates the repository on `main`
7. successful `CI` triggers Cloudflare Pages deployment and Cloudflare Worker deployment

### Local test commands
```bash
npm run content:daily
node ./scripts/review-daily-content-pr.mjs
```

## Project structure
- `src/pages` — route pages
- `src/components` — reusable UI
- `src/content` — topics, resources, publications, and published blog content
- `automation/daily-content-queue` — pre-authored daily content waiting for publication
- `worker/contact-form` — Cloudflare Worker for form handling and forwarding
- `docs` — architecture, deployment, maintenance, and plans
- `.github/workflows` — CI/CD, daily publication, PR review, and maintenance automation

## Deployment
### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Project name: `lecturer-materials`
- Trigger: successful `CI` run on `main`

### Cloudflare Worker
```bash
cd worker/contact-form
npm install
npx wrangler deploy
```

The normal production path is GitHub Actions → automated PR review → CI → Cloudflare deploys.

### Worker forwarding configuration
Non-secret defaults are in `worker/contact-form/wrangler.toml`.

Add secrets in Cloudflare Worker configuration or via Wrangler:
```bash
cd worker/contact-form
npx wrangler secret put CONTACT_WEBHOOK_URL
npx wrangler secret put RESEND_API_KEY
```

Supported forwarding modes:
- webhook only
- email only via Resend
- email via MailChannels fallback when `MAIL_FROM_EMAIL` and a real `CONTACT_EMAIL` are set
- webhook + email together

## Required GitHub secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Placeholder content to update
Automated access to the LinkedIn profile could not reliably retrieve structured profile content because LinkedIn returned access restrictions during collection. Update these manually when verified:
- short and long biography
- teaching philosophy
- education and experience timeline
- achievements and publications
- contact email
- profile photo and CV

## Daily maintenance
See `docs/maintenance.md`, `docs/deployment.md`, and `.github/workflows/` for the recurring maintenance and release framework.
