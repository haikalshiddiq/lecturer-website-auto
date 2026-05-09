# Architecture

## Recommended stack
- Astro for static-first rendering
- Tailwind CSS for the visual system
- Markdown/MDX content collections for repo-native learning material
- Cloudflare Pages for the static frontend
- Cloudflare Worker for contact handling and forwarding
- GitHub Actions for CI/CD, scheduled content publication, and maintenance review

## Frontend architecture
The site is intentionally static-first. Astro builds the public lecturer platform into `dist/`, while small dynamic behavior stays client-side inside focused interactive sections.

Key layers:
- `src/pages` — route entry points for home, about, expertise, resources, blog, publications, contact, RSS, and error pages.
- `src/components/sections` — larger homepage and listing-page sections such as the hero, topic studio, resource explorer, coverage board, stats band, and CTA blocks.
- `src/components/cards` — repeatable content cards for resources, blog posts, topics, and publications.
- `src/components/ui` — small visual primitives shared by sections.
- `src/layouts/BaseLayout.astro` — shell, theme initialization, header/footer, and SEO head.

## Collection helper layer
`src/lib/content.ts` centralizes common collection access so pages do not repeat sorting and slug logic.

It provides:
- `toSlug(id)` — normalizes `.md` and `.mdx` content IDs into extensionless public slugs.
- `getTopics()` — sorted topic collection with slug metadata.
- `getResources()` — newest-first resource collection with slug metadata.
- `getBlogPosts()` — newest-first blog collection with slug metadata.
- `getPublications()` — year-descending publication collection with slug metadata.
- `buildTopicCoverage()` — balanced topic coverage data for the homepage coverage board.

Dynamic routes and RSS should use the same `toSlug()` helper for public links to avoid `.md` / `.mdx` route drift.

## Visual primitive layer
`src/components/ui` contains reusable presentation primitives:
- `Pill.astro` — tone-aware rounded labels.
- `ActionLink.astro` — consistent CTA links with size and hover-lift controls.
- `GradientPanel.astro` — reusable gradient/card-surface wrapper.

These primitives keep the Wayground-inspired energy consistent while avoiding repeated Tailwind class blocks in sections.

## Site data layer
`src/data` stores durable site configuration and typed homepage data:
- `site.ts` — name, title, URL, navigation, public email, and social links.
- `profile.ts` — biography, teaching philosophy, education placeholders, research interests, and achievements.
- `home.ts` — homepage teaching-track card data used by the hero section.

Keep verified personal/profile facts here when they affect multiple pages.

## Content collections
`src/content.config.ts` defines four collections:
- `topics` — the three teaching pillars.
- `resources` — articles, modules, lecture notes, guides, and toolkits.
- `blog` — current teaching notes and reflections.
- `publications` — publication/project concepts and outputs.

The current architecture expects balanced coverage across:
- Information System Management
- Communication Protocol
- Artificial Intelligence

## Validation and automation scripts
Important scripts:
- `npm run validate:content` — validates collection structure and balanced topic coverage.
- `npm run check:links` — checks basic internal content links.
- `npm run build` — runs Astro type/content checks and static build.
- `npm run smoke:live` — checks live Cloudflare Pages and Worker behavior after deployment.
- `npm run content:daily` — publishes the next due queued content item.

The validator intentionally fails CI when one teaching pillar loses coverage in topics, resources, blog posts, or publications.

## Daily content queue
`automation/daily-content-queue/` stores pre-authored daily content. The scheduled workflow publishes one due item at a time, validates the generated package, commits it to `main`, and deploys the freshly built site through Cloudflare Pages.

Published queue items move into `automation/daily-content-queue/published/` for traceability.

## Cloudflare split
The deployment is split into two targets:
- **Cloudflare Pages** serves the static Astro output from `dist/` using project name `lecturer-materials`.
- **Cloudflare Worker** at `worker/contact-form` handles contact-form API requests, anti-spam screening, CORS, and optional forwarding through webhook/email channels.

This split keeps the learning platform fast and static while isolating dynamic contact behavior at the edge.

## Release flow
1. Developers or automation commit to GitHub.
2. `CI` installs dependencies, validates content, checks links, and builds.
3. Successful `main` CI triggers Pages and Worker deploy workflows.
4. Daily content publication may deploy Pages directly after its own validation gate.
5. `npm run smoke:live` verifies deployed content and Worker validation behavior.

## Notes
- Static-first rendering keeps the site fast and simple to maintain.
- Content collections make topics, resources, publications, and blog posts easy to grow.
- Daily queued content flows through GitHub for auditable history.
- The Worker can forward inquiries to a webhook, to email through Resend, or to supported Cloudflare-compatible fallback paths when configured.
