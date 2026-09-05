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

## Next upgrade
- Add Cloudflare Worker ingestion endpoint
- Store historical items in D1
- Connect Hermes cron output to structured JSON publishing
