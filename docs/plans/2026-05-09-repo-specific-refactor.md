# Lecturer Website Repo-Specific Refactor Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Refactor the existing `haikalshiddiq/lecturer-website-auto` Astro project into a cleaner, more maintainable lecturer learning platform while preserving the existing GitHub + Cloudflare deployment path.

**Architecture:** Keep the current static-first Astro + Tailwind + content collections architecture. Improve maintainability by introducing shared content helpers, typed UI section data, design-token utilities, stronger validation, and documentation that matches the live GitHub Actions → Cloudflare Pages/Worker path. Do not create a new repository, Cloudflare account, or Pages project.

**Tech Stack:** Astro 5, Tailwind CSS, TypeScript, Markdown/MDX content collections, Node.js validation scripts, GitHub Actions, Cloudflare Pages project `lecturer-materials`, Cloudflare Worker `lecturer-materials`.

---

## Current Repo Baseline

- Local path: `/home/ubuntu/projects/lecturer-website-auto`
- GitHub remote: `git@github.com:haikalshiddiq/lecturer-website-auto.git`
- Production Pages project configured in workflows: `lecturer-materials`
- Contact Worker path: `worker/contact-form`
- Contact recipient configured in Worker vars: `hicallsh@gmail.com`
- Content collections now present:
  - `src/content/topics`: 3 files
  - `src/content/resources`: 21 files
  - `src/content/blog`: 15 files
  - `src/content/publications`: 9 files
- Existing quality commands verified on 2026-05-09:
  - `npm run build` passes
  - `npm run check:links` passes
  - `npm run validate:content` passes
  - `npx wrangler deploy --config worker/contact-form/wrangler.toml --dry-run` passes

## Refactor Principles

1. Preserve current URLs unless a redirect plan is explicitly added.
2. Preserve current GitHub Actions and Cloudflare project names.
3. Prefer data-driven pages over duplicated section logic.
4. Keep the website content in English.
5. Keep the visual direction: Wayground-inspired, energetic, interactive, and credible for a lecturer profile.
6. Add validation before adding automation.
7. Commit after each task.

---

## Task 1: Create shared collection helpers

**Objective:** Remove repeated `getCollection(...).sort(...).map(...)` logic from pages and centralize slug normalization, sorting, and topic coverage computation.

**Files:**
- Create: `src/lib/content.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/resources/index.astro`
- Modify: `src/pages/publications/index.astro`

**Step 1: Create helper module**

Create `src/lib/content.ts`:

```ts
import { getCollection } from 'astro:content';

export const toSlug = (id: string) => id.replace(/\.(md|mdx)$/, '');

export async function getTopics() {
  const topics = await getCollection('topics');
  return topics
    .sort((a, b) => a.data.order - b.data.order)
    .map((topic) => ({ ...topic.data, slug: toSlug(topic.id), id: topic.id }));
}

export async function getResources() {
  const resources = await getCollection('resources');
  return resources
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map((resource) => ({ ...resource.data, slug: toSlug(resource.id), id: resource.id }));
}

export async function getBlogPosts() {
  const posts = await getCollection('blog');
  return posts
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map((post) => ({ ...post.data, slug: toSlug(post.id), id: post.id }));
}

export async function getPublications() {
  const publications = await getCollection('publications');
  return publications
    .sort((a, b) => b.data.year - a.data.year)
    .map((item) => ({ ...item.data, slug: toSlug(item.id), id: item.id }));
}

export function buildTopicCoverage({ topics, posts, resources, publications }: {
  topics: Awaited<ReturnType<typeof getTopics>>;
  posts: Awaited<ReturnType<typeof getBlogPosts>>;
  resources: Awaited<ReturnType<typeof getResources>>;
  publications: Awaited<ReturnType<typeof getPublications>>;
}) {
  return topics.map((topic) => {
    const latestPost = posts.find((post) => post.topic === topic.title);
    const latestResource = resources.find((resource) => resource.topic === topic.title);
    const latestPublication = publications.find((item) => item.topic === topic.title);

    return {
      topic: topic.title,
      postsCount: posts.filter((post) => post.topic === topic.title).length,
      resourcesCount: resources.filter((resource) => resource.topic === topic.title).length,
      publicationsCount: publications.filter((item) => item.topic === topic.title).length,
      latestPost: latestPost ? { title: latestPost.title, href: `/blog/${latestPost.slug}` } : undefined,
      latestResource: latestResource ? { title: latestResource.title, href: `/resources/${latestResource.slug}` } : undefined,
      latestPublication: latestPublication ? { title: latestPublication.title, href: latestPublication.externalUrl ?? '/publications' } : undefined
    };
  });
}
```

**Step 2: Refactor homepage imports**

In `src/pages/index.astro`, replace direct `getCollection` calls with:

```ts
import { buildTopicCoverage, getBlogPosts, getPublications, getResources, getTopics } from '../lib/content';

const topics = await getTopics();
const topicLinks = topics.map((topic) => ({
  title: topic.title,
  slug: topic.slug,
  summary: topic.summary,
  importance: topic.importance,
  subtopics: topic.subtopics,
  learningOutcomes: topic.learningOutcomes
}));
const resources = await getResources();
const publications = await getPublications();
const featuredPublications = publications.filter((item) => item.featured);
const posts = await getBlogPosts();
const topicCoverage = buildTopicCoverage({ topics, posts, resources, publications });
```

**Step 3: Refactor list pages**

Use `getBlogPosts`, `getResources`, and `getPublications` in their corresponding index pages. Keep route behavior unchanged.

**Step 4: Verify**

Run:

```bash
npm run build
```

Expected: `0 errors`, static build completes.

**Step 5: Commit**

```bash
git add src/lib/content.ts src/pages/index.astro src/pages/blog/index.astro src/pages/resources/index.astro src/pages/publications/index.astro
git commit -m "refactor: centralize content collection helpers"
```

---

## Task 2: Introduce reusable design primitives

**Objective:** Reduce repeated Tailwind class strings and make the energetic visual system easier to maintain.

**Files:**
- Create: `src/components/ui/Pill.astro`
- Create: `src/components/ui/GradientPanel.astro`
- Create: `src/components/ui/ActionLink.astro`
- Modify: `src/components/sections/Hero.astro`
- Modify: `src/components/sections/ResourceExplorer.astro`
- Modify: `src/components/sections/TopicCoverageBoard.astro`

**Step 1: Create `Pill.astro`**

```astro
---
interface Props {
  tone?: 'brand' | 'cyan' | 'fuchsia' | 'amber' | 'emerald' | 'neutral';
}
const { tone = 'neutral' } = Astro.props;
const toneClasses = {
  brand: 'border-brand-300/30 bg-brand-500/15 text-brand-100',
  cyan: 'border-cyan-300/30 bg-cyan-500/15 text-cyan-100',
  fuchsia: 'border-fuchsia-300/30 bg-fuchsia-500/15 text-fuchsia-100',
  amber: 'border-amber-300/30 bg-amber-500/15 text-amber-100',
  emerald: 'border-emerald-300/30 bg-emerald-500/15 text-emerald-100',
  neutral: 'border-white/10 bg-white/5 text-slate-100'
};
---
<span class={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${toneClasses[tone]}`}>
  <slot />
</span>
```

**Step 2: Create `ActionLink.astro`**

```astro
---
interface Props {
  href: string;
  variant?: 'primary' | 'secondary' | 'brand';
}
const { href, variant = 'primary' } = Astro.props;
const classes = {
  primary: 'bg-white text-slate-950 hover:bg-slate-100',
  secondary: 'border border-white/15 text-slate-100 hover:border-white/30 hover:bg-white/5',
  brand: 'bg-brand-500 text-white hover:bg-brand-400'
};
---
<a href={href} class={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${classes[variant]}`}>
  <slot />
</a>
```

**Step 3: Replace obvious repetitions**

Start with Hero badges/buttons and ResourceExplorer action buttons. Do not rewrite every component in one pass; keep the refactor safe.

**Step 4: Verify**

```bash
npm run build
```

Expected: build passes and generated home page still includes `Wayground-inspired learning experience`, `Explore topic studio`, and `Browse resource explorer`.

**Step 5: Commit**

```bash
git add src/components/ui src/components/sections/Hero.astro src/components/sections/ResourceExplorer.astro src/components/sections/TopicCoverageBoard.astro
git commit -m "refactor: add reusable visual primitives"
```

---

## Task 3: Strengthen profile/contact configuration

**Objective:** Remove stale placeholder contact data from the public site config and make contact details consistent with Worker configuration.

**Files:**
- Modify: `src/data/site.ts`
- Modify: `src/pages/contact.astro`
- Modify: `README.md`
- Modify: `docs/deployment.md`

**Step 1: Update site email**

In `src/data/site.ts`, set:

```ts
email: 'hicallsh@gmail.com',
```

**Step 2: Confirm contact page reads site config**

If `src/pages/contact.astro` hard-codes placeholder email, replace it with `siteConfig.email`.

**Step 3: Document forwarding state**

Update docs to state:

- Public contact recipient: `hicallsh@gmail.com`
- Worker recipient var: `CONTACT_EMAIL = "hicallsh@gmail.com"`
- Live sending still requires either `RESEND_API_KEY`, `CONTACT_WEBHOOK_URL`, or a verified Cloudflare-compatible sender path.

**Step 4: Verify**

```bash
npm run build
grep -R "<placeholder-contact-email>" -n src docs README.md worker || true
grep -R "hicallsh@gmail.com" -n src docs README.md worker
```

Expected: no public placeholder contact email remains; `hicallsh@gmail.com` appears in intended config/docs.

**Step 5: Commit**

```bash
git add src/data/site.ts src/pages/contact.astro README.md docs/deployment.md
git commit -m "fix: align public contact email with worker recipient"
```

---

## Task 4: Add content coverage validation

**Objective:** Ensure daily growth remains balanced across the three main teaching pillars.

**Files:**
- Modify: `scripts/validate-content.mjs`
- Modify: `package.json` only if a separate script is preferred

**Step 1: Extend validation rules**

Add checks that every topic has at least:

- 1 topic file in `src/content/topics`
- 1 resource in `src/content/resources`
- 1 blog post in `src/content/blog`
- 1 publication concept in `src/content/publications`

Use the existing frontmatter parsing pattern in `scripts/validate-content.mjs`.

**Step 2: Add clear failure output**

Failure message format:

```text
Content coverage validation failed:
- Artificial Intelligence has 0 recent blog posts
- Communication Protocol has 0 resources
```

**Step 3: Verify failure path safely**

Temporarily change one local parsed topic value or run the validator against a temporary fixture if easy. Do not commit test breakage.

**Step 4: Verify pass path**

```bash
npm run validate:content
```

Expected: `Content structure validation passed.` or a similarly clear success message.

**Step 5: Commit**

```bash
git add scripts/validate-content.mjs package.json
git commit -m "test: validate balanced topic coverage"
```

---

## Task 5: Add deployment smoke-check documentation and script

**Objective:** Make post-deploy verification repeatable for the existing Cloudflare Pages and Worker setup.

**Files:**
- Create: `scripts/smoke-check-live.mjs`
- Modify: `package.json`
- Modify: `docs/deployment.md`

**Step 1: Add script**

Create a Node script that checks:

- `https://lecturer-materials.pages.dev/` returns 200
- home HTML includes `Turn every visit into a guided learning journey`
- `/resources/` returns 200
- `/blog/` returns 200
- Worker root or contact endpoint returns an expected non-crash response if the public Worker URL is documented

Start with Pages checks if the Worker URL is not guaranteed.

**Step 2: Add package script**

In `package.json`:

```json
"smoke:live": "node ./scripts/smoke-check-live.mjs"
```

**Step 3: Document usage**

Add to `docs/deployment.md`:

```bash
npm run smoke:live
```

**Step 4: Verify**

```bash
npm run smoke:live
```

Expected: all configured live checks pass or the script clearly reports which URL failed.

**Step 5: Commit**

```bash
git add scripts/smoke-check-live.mjs package.json docs/deployment.md
git commit -m "chore: add live deployment smoke checks"
```

---

## Task 6: Refactor homepage section data

**Objective:** Move static homepage labels and teaching-track cards into typed data so the page is easier to update without editing long markup blocks.

**Files:**
- Create: `src/data/home.ts`
- Modify: `src/components/sections/Hero.astro`
- Modify: `src/pages/index.astro`

**Step 1: Create homepage data**

```ts
export const teachingTracks = [
  {
    label: 'Track 01',
    title: 'Information System Management',
    summary: 'Strategy, governance, and measurable digital transformation.',
    tone: 'fuchsia'
  },
  {
    label: 'Track 02',
    title: 'Communication Protocol',
    summary: 'Observable protocol logic, packet thinking, and troubleshooting discipline.',
    tone: 'cyan'
  },
  {
    label: 'Track 03',
    title: 'Artificial Intelligence',
    summary: 'Responsible adoption, prompt design, and practical academic workflows.',
    tone: 'amber'
  }
] as const;
```

**Step 2: Render tracks from data**

Replace the three hard-coded Hero track cards with `teachingTracks.map(...)`.

**Step 3: Verify**

```bash
npm run build
```

Expected: all three track names still render in `dist/index.html`.

**Step 4: Commit**

```bash
git add src/data/home.ts src/components/sections/Hero.astro src/pages/index.astro
git commit -m "refactor: make homepage teaching tracks data-driven"
```

---

## Task 7: Update architecture documentation after refactor

**Objective:** Keep documentation aligned with the final repo-specific architecture.

**Files:**
- Modify: `docs/architecture.md`
- Modify: `docs/content-guide.md`
- Modify: `docs/maintenance.md`
- Modify: `README.md`

**Step 1: Expand architecture docs**

Add sections for:

- `src/lib/content.ts` collection helper layer
- `src/components/ui` visual primitive layer
- `src/data` site/profile/home configuration layer
- validation scripts and daily content queue
- Cloudflare Pages + Worker split

**Step 2: Expand content guide**

Explain how to add:

- a new blog post
- a new resource
- a downloadable asset under `public/downloads`
- a queued daily content item

**Step 3: Verify docs references**

```bash
npm run check:links
npm run build
```

Expected: link checks and build pass.

**Step 4: Commit**

```bash
git add README.md docs/architecture.md docs/content-guide.md docs/maintenance.md
git commit -m "docs: document refactored site architecture"
```

---

## Task 8: Final integration verification and push

**Objective:** Prove the refactor is safe locally, then push to the existing GitHub repo so GitHub Actions can deploy to Cloudflare.

**Files:**
- All changed files

**Step 1: Full local verification**

```bash
npm run validate:content
npm run check:links
npm run build
npx wrangler deploy --config worker/contact-form/wrangler.toml --dry-run
git status --short --branch
```

Expected:

- content validation passes
- link check passes
- Astro check/build passes
- Worker dry-run passes
- branch is ahead only by intentional commits

**Step 2: Push to existing GitHub**

```bash
git push origin main
```

Expected: push succeeds using the existing SSH auth.

**Step 3: Watch GitHub Actions**

If `gh` is unavailable, use GitHub web UI or REST API. Expected workflows:

- `CI` succeeds
- `Deploy Cloudflare Pages` succeeds if Cloudflare secrets are valid
- `Deploy Cloudflare Worker` succeeds if Cloudflare secrets are valid

**Step 4: Verify live Pages content**

```bash
npm run smoke:live
```

Expected: live site returns 200 and includes expected homepage/resource/blog content.

**Step 5: Report outcome**

Report clearly:

- GitHub commit SHA
- whether GitHub push succeeded
- whether GitHub Actions passed
- whether Cloudflare Pages live smoke checks passed
- whether Worker deploy/smoke checks passed
- any missing secret or authentication issue without exposing secret values

---

## Acceptance Criteria

- The repo still builds with `npm run build`.
- `npm run validate:content` enforces basic balanced topic coverage.
- `npm run check:links` passes.
- Worker dry-run still passes.
- Public contact email is aligned with the Worker recipient.
- Home page remains Wayground-inspired, interactive, and energetic.
- Existing GitHub repo and Cloudflare project names are preserved.
- Refactor is committed and pushed to `haikalshiddiq/lecturer-website-auto`.
- Production deploy is verified by content checks, not only HTTP status.

## Known Risks and Guardrails

- Local Wrangler is not logged in. Use GitHub Actions for production deploy unless Cloudflare local credentials are explicitly provided.
- GitHub Actions deploys require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
- Do not claim live deployment succeeded until GitHub Actions and live Pages checks confirm it.
- Contact form acknowledgement is not the same as successful email delivery; verify forwarding secrets before claiming email delivery works.
- Keep placeholder biography/education/achievement content clearly marked until verified profile data is supplied.
