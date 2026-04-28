# Daily CI/CD Content Pipeline Implementation Plan

> **For Hermes:** This plan converts the lecturer website CI/CD story from a generic explanation into a real GitHub-to-Cloudflare release pipeline with daily content publication.

**Goal:** Publish fresh website content every day from GitHub, validate it in CI, and deploy it automatically to Cloudflare Pages plus the Cloudflare Worker path.

**Architecture:** A scheduled GitHub Actions workflow publishes one pre-authored queued article into `src/content/blog/`, commits it to `main`, and lets the normal CI pipeline validate the repo. Successful `main` CI then triggers Cloudflare Pages deployment and Cloudflare Worker deployment through dedicated workflows.

**Tech Stack:** Astro, Markdown content collections, GitHub Actions, Cloudflare Pages, Cloudflare Worker, Node.js helper scripts.

---

## Task 1: Add a real daily content source

**Objective:** Create a repo-native queue that can safely publish one article per day without requiring live AI generation inside GitHub Actions.

**Files:**
- Create: `automation/daily-content-queue/*.md`
- Create: `scripts/publish-daily-content.mjs`
- Modify: `package.json`

**Implementation notes:**
1. Store queued daily articles as Markdown files with frontmatter.
2. Script publishes the next due article into `src/content/blog/`.
3. Published queue files move into `automation/daily-content-queue/published/` for traceability.
4. The script should make no changes if nothing is due.

## Task 2: Make GitHub Actions own the release path

**Objective:** Ensure every main-branch content update passes CI before deployment to Cloudflare.

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `.github/workflows/deploy-worker.yml`
- Create: `.github/workflows/daily-content-pipeline.yml`

**Implementation notes:**
1. Keep `ci.yml` as the quality gate for `push` and `pull_request`.
2. Trigger Pages and Worker deploy workflows from successful `CI` runs on `main`.
3. Add a scheduled workflow that:
   - checks out the repo with write access,
   - runs `npm ci`,
   - runs the daily publish script,
   - validates/builds the site,
   - commits and pushes if new content was published.
4. Use UTC cron that corresponds to the user’s Asia/Jakarta preference.

## Task 3: Revise CI/CD educational content

**Objective:** Align the site’s CI/CD-related content with the actual delivery model now implemented in the repo.

**Files:**
- Modify: CI/CD-related blog posts
- Modify: CI/CD-related resources/modules
- Modify: CI/CD-related publication concepts

**Implementation notes:**
1. Replace generic pipeline descriptions with the real sequence:
   - queued content in GitHub,
   - daily publish workflow,
   - CI validation,
   - Cloudflare Pages deploy,
   - Cloudflare Worker deploy,
   - post-deploy verification.
2. Preserve the three teaching pillars:
   - Information System Management,
   - Communication Protocol,
   - Artificial Intelligence.

## Task 4: Update project docs and maintenance reporting

**Objective:** Make the repository documentation explain the real automation path.

**Files:**
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Modify: `docs/maintenance.md`
- Modify: `scripts/maintenance-report.mjs`

**Implementation notes:**
1. Explain which workflow publishes daily content.
2. Explain which workflows deploy Pages and Worker.
3. Surface queue status in the maintenance report.

## Task 5: Verify end-to-end safety

**Objective:** Prove the repo still builds and the automation is internally consistent.

**Verification checklist:**
1. Run `npm run content:daily` locally and confirm it behaves safely.
2. Run `npm run validate:content`.
3. Run `npm run check:links`.
4. Run `npm run build`.
5. Inspect `git diff` to confirm the site content and workflows match the intended pipeline.
6. Commit and push to `main` so GitHub Actions can own the Cloudflare deployment.
