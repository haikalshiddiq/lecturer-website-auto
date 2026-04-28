# Haikal Shiddiq Lecturer Website

A premium, Cloudflare-ready lecturer website built with Astro and Tailwind CSS for Haikal Shiddiq S.Kom., M.T. The project is optimized for responsive presentation, content scalability, fast global delivery, and ongoing GitHub-based maintenance.

## Stack
- Astro
- Tailwind CSS
- Cloudflare Pages
- Cloudflare Worker for contact handling and edge deployment continuity
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
This repository now has a real repo-native daily content pipeline.

### How it works
1. prepare queued articles in `automation/daily-content-queue/`
2. GitHub Actions runs `.github/workflows/daily-content-pipeline.yml` every day
3. the workflow publishes the next due article into `src/content/blog/`
4. the workflow commits and pushes the update to `main`
5. `CI` validates the repository
6. successful `CI` triggers Cloudflare Pages deployment and Cloudflare Worker deployment

### Local test command
```bash
npm run content:daily
```

## Project structure
- `src/pages` — route pages
- `src/components` — reusable UI
- `src/content` — topics, resources, publications, and published blog content
- `automation/daily-content-queue` — pre-authored daily content waiting for publication
- `worker/contact-form` — Cloudflare Worker for form handling
- `docs` — architecture, deployment, maintenance, and plans
- `.github/workflows` — CI/CD, daily publication, and maintenance automation

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

The normal production path is GitHub Actions → CI → Cloudflare Worker deploy.

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
