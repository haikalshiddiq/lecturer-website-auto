# Deployment

## Cloudflare Pages
- Project name: `lecturer-materials`
- Build command: `npm run build`
- Output directory: `dist`

## Cloudflare Worker
- Worker name: `lecturer-materials`
- Working directory: `worker/contact-form`
- Route: `https://lecturer-materials.hicall.workers.dev/api/contact` via workers.dev unless a custom route is configured

## Required secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
