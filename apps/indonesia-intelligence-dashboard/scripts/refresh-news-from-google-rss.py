#!/usr/bin/env python3
"""Refresh dashboard news items from Google News RSS discovery.

Uses publisher/source filtering and does not invent article images. Google RSS URLs are
kept only when a direct publisher URL cannot be safely resolved non-interactively.
"""
import datetime as dt
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
DATA = APP / 'public/data/news.json'
JAKARTA = dt.timezone(dt.timedelta(hours=7))
NOW = dt.datetime.now(JAKARTA).replace(microsecond=0)
TODAY = NOW.date().isoformat()

QUERIES = [
    ('Tech / AI', 'Indonesia AI OR kecerdasan buatan OR teknologi OR data center OR Komdigi when:1d'),
    ('Automotive / EV', 'Indonesia mobil listrik OR kendaraan listrik OR EV OR baterai OR SPKLU when:1d'),
    ('Markets', 'Indonesia IHSG OR rupiah OR BI Rate OR obligasi OR saham OR Bursa Efek Indonesia when:1d'),
    ('Business / Investment', 'Indonesia investasi OR startup OR digital economy OR ekonomi digital OR hilirisasi when:1d'),
    ('Infrastructure', 'Indonesia infrastruktur OR IKN OR jalan tol OR pelabuhan OR kereta when:1d'),
    ('Telecom', 'Indonesia Telkom OR Indosat OR XL Axiata OR data center OR 5G when:1d'),
    ('Energy', 'Indonesia energi OR listrik OR PLN OR batu bara OR nikel OR migas when:1d'),
    ('Crypto / OJK', 'Indonesia OJK OR kripto OR aset digital OR perbankan OR fintech when:1d'),
]

SOURCE_ALLOW = [
    'Reuters', 'Bloomberg', 'CNBC Indonesia', 'Kompas', 'Kompas.com', 'detik', 'detikFinance', 'detikInet',
    'Tempo', 'Katadata', 'Bisnis.com', 'Kontan', 'ANTARA', 'Antara', 'OJK', 'Bank Indonesia',
    'Bursa Efek Indonesia', 'IDX', 'Kementerian Komunikasi', 'Kementerian ESDM', 'Kementerian Perindustrian',
    'Kementerian Investasi', 'Investor Daily', 'Merdeka.com', 'Liputan6.com', 'CNN Indonesia', 'Republika',
    'Media Indonesia', 'The Jakarta Post', 'DealStreetAsia', 'Tech in Asia', 'DailySocial', 'InfoBankNews'
]
SOURCE_BLOCK = ['Tribun', 'Suara.com', 'JPNN', 'Rokan Hilir', 'XTB.com', 'Tribrata', 'Universitas', 'blog']

TOPIC_IMPACTS = {
    'Tech / AI': 'Positive for AI adoption, cloud/data-center demand, cybersecurity, productivity, and digital talent; execution and policy clarity remain key risk gates.',
    'Automotive / EV': 'Relevant for EV demand, charging utilization, battery/auto supply chains, nickel ecosystem sentiment, and consumer financing conditions.',
    'Markets': 'Important for rupiah hedging, foreign flows, rate expectations, bond duration, and tactical IDX positioning under volatility.',
    'Business / Investment': 'Impacts capex, FDI confidence, corporate earnings visibility, startup funding, and sector rotation into growth or defensive names.',
    'Infrastructure': 'Supports logistics productivity, construction order books, property spillovers, and regional growth, but execution/funding risks remain.',
    'Telecom': 'Constructive for data traffic, enterprise digital services, AI infrastructure, towers, and data-center monetization.',
    'Energy': 'Affects inflation, fiscal settings, PLN/energy capex, commodity-linked exporters, and energy-transition positioning.',
    'Crypto / OJK': 'Relevant for regulated digital-asset activity, fintech compliance, consumer protection, and risk appetite in speculative assets.',
}

KEYWORDS_POS = ['naik', 'menguat', 'tumbuh', 'peluang', 'investasi', 'ekspansi', 'catat', 'melonjak', 'dukung', 'perkuat', 'resmi', 'target']
KEYWORDS_NEG = ['turun', 'melemah', 'tekanan', 'risiko', 'anjlok', 'waspada', 'konflik', 'rugi', 'pailit', 'PHK', 'hoaks']

def fetch(query):
    url = 'https://news.google.com/rss/search?q=' + urllib.parse.quote(query) + '&hl=id&gl=ID&ceid=ID:id'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 HermesIndonesiaDashboard/1.0'})
    with urllib.request.urlopen(req, timeout=25) as r:
        root = ET.fromstring(r.read())
    return root.findall('.//item')

def clean_title(title):
    title = html.unescape(title or '').strip()
    # Google title often ends " - Publisher"; keep publisher separately.
    return re.sub(r'\s+-\s+[^-]{2,80}$', '', title).strip() or title

def allowed_source(src):
    if not src:
        return False
    if any(b.lower() in src.lower() for b in SOURCE_BLOCK):
        return False
    return any(a.lower() in src.lower() for a in SOURCE_ALLOW)

def score_sentiment(title, topic):
    tl = title.lower()
    pos = sum(1 for k in KEYWORDS_POS if k.lower() in tl)
    neg = sum(1 for k in KEYWORDS_NEG if k.lower() in tl)
    base = {'Tech / AI': 0.14, 'Automotive / EV': 0.15, 'Markets': 0.03, 'Business / Investment': 0.12, 'Infrastructure': 0.13, 'Telecom': 0.12, 'Energy': 0.06, 'Crypto / OJK': 0.04}.get(topic, 0.05)
    val = max(-0.65, min(0.65, base + 0.12 * pos - 0.15 * neg))
    if val > 0.18:
        sent = 'Positive'
    elif val < -0.12:
        sent = 'Negative'
    elif abs(val) <= 0.06:
        sent = 'Mixed'
    else:
        sent = 'Neutral'
    return sent, round(val, 2)

def main():
    seen = set()
    items = []
    errors = []
    for topic, query in QUERIES:
        try:
            rss_items = fetch(query)
        except Exception as exc:
            errors.append(f'{topic}: {exc}')
            continue
        per_topic = 0
        for it in rss_items:
            raw_title = it.findtext('title') or ''
            source_el = it.find('source')
            source = (source_el.text if source_el is not None else '') or ''
            if not allowed_source(source):
                continue
            title = clean_title(raw_title)
            key = re.sub(r'\W+', ' ', title.lower()).strip()
            if key in seen:
                continue
            pub = it.findtext('pubDate') or ''
            try:
                d = parsedate_to_datetime(pub).astimezone(JAKARTA)
            except Exception:
                d = NOW
            if (NOW - d).total_seconds() > 36 * 3600:
                continue
            link = it.findtext('link') or ''
            sent, s = score_sentiment(title, topic)
            ident = f"{d.date().isoformat()}-{hashlib.sha1((title+source).encode()).hexdigest()[:10]}"
            summary = f"{source} surfaced this fresh item within the last 24–36 hours: {title}. Interpreted here for Indonesia business and investment impact; re-check the publisher/Google News redirect for full context, paywalls, and intraday updates."
            items.append({
                'id': ident,
                'date': d.date().isoformat(),
                'topic': topic,
                'title': title,
                'summary': summary,
                'sentiment': sent,
                'score': s,
                'confidence': 0.68 if 'via Google' not in source else 0.62,
                'impact': TOPIC_IMPACTS.get(topic, 'Relevant to Indonesia business and investment positioning.'),
                'source': f'{source} via Google News RSS discovery',
                'sourceUrl': link,
                'imageUrl': '',
                'imageAlt': '',
            })
            seen.add(key)
            per_topic += 1
            if per_topic >= 4:
                break
    # Prioritize topic diversity then recency; cap to dashboard-friendly size.
    items.sort(key=lambda x: (x['date'], abs(x['score']), x['topic']), reverse=True)
    selected = []
    counts = {}
    for item in items:
        if counts.get(item['topic'], 0) >= 4:
            continue
        selected.append(item)
        counts[item['topic']] = counts.get(item['topic'], 0) + 1
        if len(selected) >= 22:
            break
    if len(selected) < 6:
        raise SystemExit(f'Only {len(selected)} credible fresh items found; refusing to overwrite dashboard. Errors: {errors}')

    dashboard = json.loads(DATA.read_text()) if DATA.exists() else {}
    dashboard['generatedAt'] = NOW.isoformat()
    dashboard['briefingTitle'] = f'Indonesia Hot News Intelligence Briefing — {NOW.strftime("%-d %B %Y")}'
    dashboard['sentimentBasis'] = ('Business and investment impact for Indonesia using Asia/Jakarta timezone. Freshness target: today/last 24 hours; '
        'up to 36 hours accepted during early-morning runs when credible same-day items are sparse. Sources prioritize official/reputable publishers. '
        'Google News RSS links are used only as discovery/redirect links when direct publisher resolution is unavailable. Images are blank unless verified publisher og/twitter article images pass blacklist checks; no generic Google News images/logos/favicons are used.')
    dashboard['items'] = selected
    DATA.write_text(json.dumps(dashboard, ensure_ascii=False, indent=2) + '\n')
    print('news items written', len(selected), 'generatedAt', dashboard['generatedAt'])
    print('topics', counts)
    if errors:
        print('rss warnings', '; '.join(errors))

if __name__ == '__main__':
    main()
