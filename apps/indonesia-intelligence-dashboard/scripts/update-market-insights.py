#!/usr/bin/env python3
"""Refresh forex and IDX stock opportunity analytics for the dashboard JSON.

Uses Yahoo Finance chart endpoints for lightweight market data. The output is an
analytical screen, not financial advice.
"""
import datetime
import json
import math
import statistics
import urllib.request
from pathlib import Path
from urllib.parse import quote

APP = Path(__file__).resolve().parents[1]
DATA = APP / 'public/data/news.json'

FOREX = {
    # Interpretation: if an Indonesian investor starts with IDR, converts into this foreign currency,
    # then converts back into IDR later, the return is approximated by this currency's appreciation
    # versus IDR after fees/spread are ignored.
    'USD': {'symbol': 'USDIDR=X', 'label': 'US Dollar', 'useCase': 'Hard-currency hedge, import pricing, dollar assets'},
    'EUR': {'symbol': 'EURIDR=X', 'label': 'Euro', 'useCase': 'Europe exposure and diversification'},
    'GBP': {'symbol': 'GBPIDR=X', 'label': 'British Pound', 'useCase': 'UK exposure and hard-currency diversification'},
    'CHF': {'symbol': 'CHFIDR=X', 'label': 'Swiss Franc', 'useCase': 'Defensive safe-haven currency exposure'},
    'JPY': {'symbol': 'JPYIDR=X', 'label': 'Japanese Yen', 'useCase': 'Japan travel/tuition/import planning'},
    'SGD': {'symbol': 'SGDIDR=X', 'label': 'Singapore Dollar', 'useCase': 'ASEAN safe-haven and regional cash proxy'},
    'AUD': {'symbol': 'AUDIDR=X', 'label': 'Australian Dollar', 'useCase': 'Commodity-cycle proxy and education/travel exposure'},
    'NZD': {'symbol': 'NZDIDR=X', 'label': 'New Zealand Dollar', 'useCase': 'Commodity and Oceania exposure'},
    'CAD': {'symbol': 'CADIDR=X', 'label': 'Canadian Dollar', 'useCase': 'North America commodity-linked diversification'},
    'HKD': {'symbol': 'HKDIDR=X', 'label': 'Hong Kong Dollar', 'useCase': 'USD-linked Asia liquidity proxy'},
    'CNY': {'symbol': 'CNYIDR=X', 'label': 'Chinese Yuan', 'useCase': 'China trade exposure; data availability may vary'},
    'KRW': {'symbol': 'KRWIDR=X', 'label': 'Korean Won', 'useCase': 'Korea tech/manufacturing exposure'},
    'THB': {'symbol': 'THBIDR=X', 'label': 'Thai Baht', 'useCase': 'ASEAN tourism/consumption exposure'},
    'MYR': {'symbol': 'MYRIDR=X', 'label': 'Malaysian Ringgit', 'useCase': 'Regional ASEAN tactical exposure'},
    'PHP': {'symbol': 'PHPIDR=X', 'label': 'Philippine Peso', 'useCase': 'ASEAN regional diversification'},
    'INR': {'symbol': 'INRIDR=X', 'label': 'Indian Rupee', 'useCase': 'India growth exposure'},
    'AED': {'symbol': 'AEDIDR=X', 'label': 'UAE Dirham', 'useCase': 'USD-linked Gulf exposure'},
    'SAR': {'symbol': 'SARIDR=X', 'label': 'Saudi Riyal', 'useCase': 'USD-linked Gulf/hajj-umrah planning exposure'},
}

STOCKS = {
    'BBCA': {'symbol': 'BBCA.JK', 'sector': 'Banking', 'thesis': 'Quality private-bank franchise; usually one of the cleaner defensive rebound candidates when foreign flows return.'},
    'BMRI': {'symbol': 'BMRI.JK', 'sector': 'Banking', 'thesis': 'Large state-bank liquidity and corporate banking exposure; attractive only if market stress stabilizes.'},
    'BBRI': {'symbol': 'BBRI.JK', 'sector': 'Banking / Microfinance', 'thesis': 'High-beta recovery candidate; upside can be large, but asset-quality concerns make risk higher in red markets.'},
    'TLKM': {'symbol': 'TLKM.JK', 'sector': 'Telecom / Digital Infrastructure', 'thesis': 'Defensive telecom cash flow plus data-center/AI infrastructure narrative; useful in volatile IHSG conditions.'},
    'ISAT': {'symbol': 'ISAT.JK', 'sector': 'Telecom', 'thesis': 'Mobile-data growth and consolidation story; more beta than TLKM but can outperform if sector sentiment improves.'},
    'ICBP': {'symbol': 'ICBP.JK', 'sector': 'Consumer Staples', 'thesis': 'Staples defensiveness and pricing power; weaker rupiah can pressure costs but food demand is resilient.'},
    'ASII': {'symbol': 'ASII.JK', 'sector': 'Conglomerate / Auto', 'thesis': 'Auto, financial services, and commodity mix; cyclical rebound candidate if rates/currency stabilize.'},
    'UNTR': {'symbol': 'UNTR.JK', 'sector': 'Heavy Equipment / Coal', 'thesis': 'Resource and dollar-linked hedge characteristics; watch coal and capex cycle.'},
    'ADRO': {'symbol': 'ADRO.JK', 'sector': 'Energy', 'thesis': 'Energy cash-flow hedge; dividend appeal can help but commodity risk remains high.'},
    'AMMN': {'symbol': 'AMMN.JK', 'sector': 'Copper / Gold', 'thesis': 'Copper/gold exposure offers commodity hedge, but valuation and volatility are high.'},
    'BRIS': {'symbol': 'BRIS.JK', 'sector': 'Sharia Banking', 'thesis': 'Structural sharia banking growth; volatility and valuation discipline matter.'},
    'MDKA': {'symbol': 'MDKA.JK', 'sector': 'Metals / Gold', 'thesis': 'Gold/copper-linked recovery candidate; best treated as high-risk tactical exposure.'},
}

DEFENSIVE = {
    'Banking': 0.8,
    'Telecom / Digital Infrastructure': 0.95,
    'Telecom': 0.85,
    'Consumer Staples': 0.9,
    'Heavy Equipment / Coal': 0.55,
    'Energy': 0.55,
    'Copper / Gold': 0.5,
    'Metals / Gold': 0.45,
    'Conglomerate / Auto': 0.55,
    'Banking / Microfinance': 0.45,
    'Sharia Banking': 0.5,
}

def chart(sym, range_='1y', interval='1d'):
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{quote(sym)}?range={range_}&interval={interval}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 HermesDashboard/1.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    res = data['chart']['result'][0]
    quote0 = res['indicators']['quote'][0]
    pairs = []
    for t, c in zip(res.get('timestamp', []), quote0.get('close', [])):
        if c is not None:
            pairs.append((datetime.datetime.utcfromtimestamp(t).date().isoformat(), float(c)))
    return pairs

def pct(a, b):
    return round((b / a - 1) * 100, 2) if a else 0

def metrics(sym):
    pairs = chart(sym)
    vals = [v for _, v in pairs]
    if len(vals) < 10:
        raise RuntimeError(f'not enough data for {sym}')
    last = vals[-1]
    rets = [vals[i] / vals[i - 1] - 1 for i in range(1, len(vals)) if vals[i - 1]]
    vol = round(statistics.stdev(rets) * math.sqrt(252) * 100, 2) if len(rets) > 2 else 0
    peak = vals[0]
    dd = 0
    for v in vals:
        peak = max(peak, v)
        dd = min(dd, (v / peak - 1) * 100)
    def back(n):
        return vals[-n] if len(vals) > n else vals[0]
    return {
        'last': round(last, 4),
        'date': pairs[-1][0],
        'return1m': pct(back(22), last),
        'return3m': pct(back(66), last),
        'return6m': pct(back(132), last),
        'return1y': pct(vals[0], last),
        'volatility': vol,
        'maxDrawdown': round(dd, 2),
        'sparkline': [{'date': d, 'value': round(v, 4)} for d, v in pairs[-60:]],
    }

def main():
    forex_rows = []
    for pair, meta in FOREX.items():
        try:
            m = metrics(meta['symbol'])
            score = round(m['return1m'] * 0.30 + m['return3m'] * 0.35 + m['return6m'] * 0.25 - m['volatility'] * 0.04, 2)
            view = 'Most attractive IDR hedge' if score > 5 else ('Watchlist / tactical' if score > 2 else 'Less attractive right now')
            forex_rows.append({**meta, 'pair': pair, **m, 'profitScore': score, 'view': view})
        except Exception as exc:
            print(f'forex skipped {pair}: {exc}')
    forex_rows.sort(key=lambda x: x['profitScore'], reverse=True)

    stock_rows = []
    for code, meta in STOCKS.items():
        try:
            m = metrics(meta['symbol'])
            d = DEFENSIVE.get(meta['sector'], 0.5)
            score = round(50 + m['return1m'] * 1.2 + m['return3m'] * 0.55 + d * 18 - max(0, m['volatility'] - 30) * 0.25 + max(m['maxDrawdown'], -60) * 0.15, 1)
            risk = 'High' if m['volatility'] > 55 or m['maxDrawdown'] < -45 else ('Medium' if m['volatility'] > 35 or m['maxDrawdown'] < -30 else 'Lower')
            stock_rows.append({**meta, 'code': code, **m, 'opportunityScore': max(0, min(100, score)), 'risk': risk})
        except Exception as exc:
            print(f'stock skipped {code}: {exc}')
    stock_rows.sort(key=lambda x: x['opportunityScore'], reverse=True)

    dashboard = json.loads(DATA.read_text())
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).replace(microsecond=0).isoformat()
    dashboard['generatedAt'] = now
    dashboard['marketInsights'] = {
        'generatedAt': now,
        'marketContext': 'IHSG is under pressure and rupiah weakness raises imported-inflation, foreign-flow, and funding-cost risk. This section is analytical screening, not financial advice.',
        'forexBasis': 'Starting point is IDR: this ranks which foreign currency would have produced the strongest IDR return if you had exchanged rupiah into that currency earlier and converted back to rupiah now. Scores use 1M/3M/6M appreciation versus IDR minus volatility penalty; fees/spread/tax are excluded, so this is a screen, not guaranteed profit.',
        'forexComparison': forex_rows,
        'bestForex': forex_rows[0] if forex_rows else None,
        'stockBasis': 'Potential-cuan screen combines short-term momentum, 3-month trend, volatility/drawdown control, and red-market defensiveness. Always re-check fundamentals, valuation, and risk before buying.',
        'stockOpportunities': stock_rows[:8],
        'sources': [
            {'name': 'Yahoo Finance chart API', 'url': 'https://query1.finance.yahoo.com/v8/finance/chart/'},
            {'name': 'Dashboard briefing/news sources', 'url': 'https://indonesia-intelligence-dashboard.pages.dev/data/news.json'},
        ],
    }
    DATA.write_text(json.dumps(dashboard, ensure_ascii=False, indent=2) + '\n')
    print('marketInsights written', now, 'forex', len(forex_rows), 'stocks', len(stock_rows))
    if forex_rows:
        print('best forex', forex_rows[0]['pair'], forex_rows[0]['profitScore'])
    if stock_rows:
        print('top stocks', ', '.join(f"{s['code']}:{s['opportunityScore']}" for s in stock_rows[:5]))

if __name__ == '__main__':
    main()
