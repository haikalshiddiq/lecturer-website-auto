# Indonesia Intelligence Dashboard

Cloudflare Pages-ready React/Vite dashboard that turns daily and weekly Indonesia news into source-linked sentiment, topic, market, and family decision-support analytics.

## Stack
- Vite + React
- Recharts
- Static JSON MVP at `public/data/news.json`
- Weekly report and archive at `public/data/weekly.json` and `public/data/weekly/`
- Cloudflare Pages default domain deployment

## Commands
```bash
npm install
npm run weekly:generate
npm run check
npm run build
npx wrangler pages deploy dist --project-name=indonesia-intelligence-dashboard
```

## Weekly report

- Page: `/weekly/`
- Publishes automatically every Sunday at 07:00 WIB through `.github/workflows/weekly-indonesia-intelligence.yml`
- Tracks 13 fields and marks missing coverage explicitly
- Uses three evidence levels: `Pantau`, `Siapkan Opsi`, and `Pertimbangkan Bertindak`
- Includes sentiment trends, topic scores, source-linked highlights, family decision triggers, and a planning radar for Malaysia, Taiwan, and Japan
- The condition index is a headline-level news signal, not a personal-safety guarantee or relocation recommendation

## Daily no-agent publisher

- Runtime entry point stays `/home/ubuntu/.hermes/scripts/indonesia_hot_news_dashboard.py`; `scripts/publish-daily.py` is its version-controlled mirror. Keep their SHA-256 values identical when updating the runtime.
- `npm run test:publisher` exercises RSS freshness/attribution, limited-evidence prose, title sentiment, FX horizon, release verification, dependency recovery, and the one-message report budget without network or publishing.
- Accept only dated RSS items from the last 48 hours (maximum five minutes future clock tolerance). A publisher label is attribution, not proof that the full article was checked. Preserve discovery URLs and distinguish headline-only records from RSS excerpts.
- The sentiment chart is a title-word heuristic, not an impact forecast. Confidence 0.35 is an explicit limited-evidence marker, not a calibrated probability. Business follow-up questions are not reported findings.
- Install dependencies for each fresh isolated worktree. This is normal setup, not evidence of dependency drift. After a failed gate, one bounded reinstall/recheck is allowed; never roll source back to hide a genuine failing gate.
- Publish once through GitHub Actions, inspect the workflow for the exact commit, then compare the complete live JSON with the intended payload using canonical SHA-256. Direct Cloudflare deployment is fallback-only. A release that is neither workflow/live verified nor fallback/live verified exits nonzero with actual evidence, not an assumed token diagnosis.
- Stdout is a compact Indonesian briefing capped at 3,500 UTF-16 units. Raw discovery links stay in dashboard records rather than consuming the Telegram message budget.
- Full gate logs, screenshots, the published JSON, and release evidence are retained in ignored `artifacts/publisher-latest/` after the isolated worktree is removed. Do not commit these artifacts.
- For one atomic repair release, commit only dashboard changes locally, then run the canonical runtime with `--include-commit <exact-40-character-SHA>`. It validates the commit scope and cherry-picks it onto current `origin/main` in an isolated worktree before collecting, checking and pushing code plus data together. Normal scheduled runs need no argument. The source checkout and unrelated dirty/staged files are not reset.

The cron schedule and no-agent mode are managed outside this dashboard and are not changed by the publisher.
