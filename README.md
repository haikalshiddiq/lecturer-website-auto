# Haikal Shiddiq Lecturer Website

A premium, Cloudflare-ready lecturer website built with Astro and Tailwind CSS for Haikal Shiddiq S.Kom., M.T. The project is optimized for responsive presentation, content scalability, fast global delivery, and ongoing GitHub-based maintenance.

## Stack
- Astro
- Tailwind CSS
- Cloudflare Pages
- Optional Cloudflare Worker for contact handling
- GitHub Actions CI/CD

## Local development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Project structure
- `src/pages` — route pages
- `src/components` — reusable UI
- `src/content` — topics, resources, and publications
- `worker/contact-form` — Cloudflare Worker for form handling
- `docs` — architecture, deployment, and maintenance docs
- `.github/workflows` — CI/CD and maintenance automation

## Deployment
### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Project name: `lecturer-materials`

### Cloudflare Worker
```bash
cd worker/contact-form
npm install
npx wrangler deploy
```

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
See `docs/maintenance.md` and `.github/workflows/daily-maintenance.yml` for the recurring maintenance framework.
