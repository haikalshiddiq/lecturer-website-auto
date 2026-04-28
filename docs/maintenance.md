# Daily Maintenance and Content Automation

The repository now has **two separate recurring automation tracks**:

## 1. Daily content publication
Workflow: `.github/workflows/daily-content-pipeline.yml`

Purpose:
1. publish the next due article from `automation/daily-content-queue/`
2. validate content integrity
3. build the site
4. commit and push to `main`
5. let GitHub CI trigger Cloudflare Pages and Worker deployment

Use this for safe, pre-authored website growth.

## 2. Daily maintenance review
Workflow: `.github/workflows/daily-maintenance.yml`

Purpose:
1. inspect repository state and workflow health
2. verify build stability
3. review queue status and content coverage
4. generate a maintenance report
5. document meaningful findings for future improvement

## Release discipline
- Non-trivial code or architecture changes should still use branch + PR discipline.
- Scheduled content publication can go directly to `main` because it comes from a reviewed queue stored in GitHub.
- Cloudflare deployment should happen only after successful CI on `main`.
