# Indonesia Intelligence Dashboard

Cloudflare Pages-ready React/Vite dashboard that turns Hermes daily Indonesia hot-news briefing into sentiment, topic, and executive impact analytics.

## Stack
- Vite + React
- Recharts
- Static JSON MVP at `public/data/news.json`
- Cloudflare Pages default domain deployment

## Commands
```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=indonesia-intelligence-dashboard
```

## Next upgrade
- Add Cloudflare Worker ingestion endpoint
- Store historical items in D1
- Connect Hermes cron output to structured JSON publishing
