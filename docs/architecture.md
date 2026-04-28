# Architecture

## Recommended stack
- Astro
- Tailwind CSS
- Cloudflare Pages
- Cloudflare Worker for contact handling and forwarding
- GitHub Actions for CI/CD and scheduled content review

## Notes
- Static-first rendering keeps the site fast and simple to maintain.
- Content collections make topics, resources, and publications easy to grow.
- Daily queued content now flows through an automated PR review stage before merge and deployment.
- The worker can forward inquiries to a webhook, to email through Resend, or to both channels at once.
