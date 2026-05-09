# Content Guide

## Priority placeholders to replace
- Verified biography details
- Education timeline
- Teaching experience and affiliations
- Research outputs and achievements
- Profile image and CV

The public contact recipient is already aligned to `hicallsh@gmail.com`; update it only if the production Worker recipient changes too.

## Collections
The site uses Astro content collections defined in `src/content.config.ts`:

- `src/content/topics` — the three main teaching pillars.
- `src/content/resources` — teaching assets, modules, guides, and toolkits.
- `src/content/blog` — current teaching notes and reflections.
- `src/content/publications` — publication/project concepts and outputs.

Keep coverage balanced across:
- Information System Management
- Communication Protocol
- Artificial Intelligence

Run this before committing content changes:

```bash
npm run validate:content
npm run check:links
npm run build
```

## Add a new blog post
1. Create a Markdown file in `src/content/blog/` with an extensionless filename-friendly slug, for example:
   - `src/content/blog/teaching-network-diagnostics-with-release-evidence.md`
2. Add frontmatter that matches the blog schema:

```md
---
title: "Teaching Network Diagnostics with Release Evidence"
summary: "A short explanation of how packet evidence and deployment traces can help students reason about protocol behavior."
topic: "Communication Protocol"
publishedAt: 2026-05-10
tags:
  - protocols
  - teaching
  - evidence
featured: false
---

Write the post body here.
```

3. Keep `topic` exactly one of the three configured topic names.
4. Run validation/build commands before commit.

## Add a new resource
1. Create a Markdown or MDX file in `src/content/resources/`, for example:
   - `src/content/resources/protocol-diagnostics-lab.md`
2. Add frontmatter that matches the resource schema:

```md
---
title: "Protocol Diagnostics Lab"
summary: "A classroom-ready lab for tracing latency, headers, and retry behavior."
topic: "Communication Protocol"
level: "Intermediate"
format: "Toolkit"
featured: false
publishedAt: 2026-05-10
tags:
  - protocol
  - diagnostics
  - lab
downloadUrl: "/downloads/protocol-diagnostics-lab.md"
ctaLabel: "Download lab"
---

Write the resource body here.
```

3. If the resource has a downloadable companion file, add that file under `public/downloads/` and point `downloadUrl` to `/downloads/<file-name>`.
4. Run:

```bash
npm run validate:content
npm run check:links
npm run build
```

## Add a downloadable asset
1. Put static download files in `public/downloads/`.
2. Use lowercase, hyphenated filenames, for example:
   - `public/downloads/ai-evaluation-rubric.md`
   - `public/downloads/protocol-sequence-map.svg`
3. Link to the asset from a resource frontmatter field:

```yaml
downloadUrl: "/downloads/ai-evaluation-rubric.md"
ctaLabel: "Download rubric"
```

4. For SVG files, validate the XML and escape raw ampersands as `&amp;`.
5. After deployment, prefer a real GET check over only HEAD when confirming download assets are live.

## Add a queued daily content item
1. Add a pre-authored Markdown file to `automation/daily-content-queue/`.
2. Use a due-date-oriented filename such as:
   - `2026-05-10-ai-evaluation-rubric.md`
3. Include normal blog frontmatter because the publish script moves due queue items into `src/content/blog/`.
4. Run locally if you want to preview the next due publication:

```bash
npm run content:daily
npm run validate:content
npm run check:links
npm run build
```

5. Review the generated change before committing. Published queue items should move into `automation/daily-content-queue/published/` for traceability.

## Slugs and links
Use extensionless public links. The shared helper `src/lib/content.ts` normalizes `.md` and `.mdx` files into extensionless URLs.

Examples:
- Source file: `src/content/resources/ai-foundations.mdx`
- Public URL: `/resources/ai-foundations/`

Avoid linking to `.md` or `.mdx` public routes directly.
