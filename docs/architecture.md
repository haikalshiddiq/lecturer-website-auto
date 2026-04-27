# Architecture

## Recommended stack
- Astro
- Tailwind CSS
- Cloudflare Pages
- Optional Cloudflare Worker for contact handling
- GitHub Actions for CI/CD

## Notes
- Static-first rendering keeps the site fast and simple to maintain.
- Content collections make topics, resources, and publications easy to grow.
- The worker is intentionally lightweight and can later forward email through a provider of choice.
