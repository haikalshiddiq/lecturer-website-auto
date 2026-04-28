# Deployment

## Release architecture

This repository now uses a GitHub-owned release path:

1. queued daily content lives in `automation/daily-content-queue/`
2. `.github/workflows/daily-content-pipeline.yml` publishes the next due article to `src/content/blog/`
3. the workflow commits and pushes to `main`
4. `.github/workflows/ci.yml` validates the repo on `main`
5. successful CI triggers:
   - `.github/workflows/deploy-pages.yml`
   - `.github/workflows/deploy-worker.yml`

That means the website content is updated in GitHub first, then deployed outward to Cloudflare.

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

## Daily content automation
- Queue directory: `automation/daily-content-queue/`
- Publish script: `npm run content:daily`
- Schedule: `00:15 UTC` daily (`07:15 WIB`)

## Required secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
