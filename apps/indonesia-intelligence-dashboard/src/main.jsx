import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, Globe2, Newspaper, Radar, TrendingUp } from 'lucide-react';
import '@fontsource/geist-sans/latin-400.css';
import '@fontsource/geist-sans/latin-600.css';
import '@fontsource/geist-sans/latin-700.css';
import '@fontsource/geist-mono/latin-400.css';
import '@fontsource/geist-mono/latin-600.css';
import '@fontsource/geist-mono/latin-700.css';
import './styles.css';
import './reference-theme.css';

/* ── Design tokens ── */
const COLORS = {
  accent: '#2563eb',
  accentBright: '#3b82f6',
  positive: '#059669',
  neutral: '#a16207',
  negative: '#dc2626',
  chartGrid: '#dbe4ef',
  chartGridSub: '#edf2f7',
  textMuted: '#64748b',
};
const sentimentColors = { Positive: COLORS.positive, Neutral: COLORS.neutral, Negative: COLORS.negative };
const topicColors = ['#3b82f6','#60a5fa','#22c55e','#eab308','#f97316','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const blockedImageTokens = ['google_news_', 'favicon', 'sprite', 'pixel', 'logo', 'J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc'];

function validImageUrl(url='') {
  return url.startsWith('https://') && !blockedImageTokens.some(t => url.toLowerCase().includes(t.toLowerCase()));
}

/* ── Animated number counter ── */
function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = display || 0;
    const to = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    if (from === to) { setDisplay(to); return; }

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/* ── Card ── */
function Card({ children, className = '', ...props }) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}

/* ── Stat block ── */
function Stat({ icon: Icon, label, value, hint }) {
  return (
    <Card className="stat">
      <div className="stat-icon"><Icon size={18} /></div>
      <div>
        <p>{label}</p>
        <strong><AnimatedNumber value={value} /></strong>
        <span className="stat-hint">{hint}</span>
      </div>
    </Card>
  );
}

/* ── Custom tooltip ── */
function CockpitTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1f1f23', border: '1px solid #27272a', borderRadius: 8,
      padding: '8px 10px', fontFamily: 'Geist Mono, monospace', fontSize: 11,
      color: '#f4f4f5', lineHeight: 1.5
    }}>
      {label && <div style={{ color: '#71717a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#a1a1aa' }}>{p.name}:</span>
          <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Mini card (opportunity/risk) ── */
function Mini({ item }) {
  return (
    <div className="mini">
      <b>{item.topic}</b>
      <span>{item.title}</span>
    </div>
  );
}

/* ── Helpers ── */
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function scoreLabel(s) { if (s > 0.2) return 'Positive'; if (s < -0.2) return 'Negative'; return 'Neutral'; }
function pct(n) { return `${Number(n || 0).toFixed(2)}%`; }
function money(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
function formatDate(s) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(s)) + ' WIB';
}

/* ── Shared chart margin ── */
const CHART_MARGIN = { top: 5, right: 12, bottom: 5, left: -10 };

/* ── App ── */
function App() {
  const [data, setData] = useState(null);
  const [topic, setTopic] = useState('All');
  const [sentiment, setSentiment] = useState('All');
  const [forexPair, setForexPair] = useState('');
  const [usTicker, setUsTicker] = useState('');
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetch(`/data/news.json?v=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const payload = await resp.json();
        if (!cancelled) { setData(payload); setLoadState({ status: 'live', message: 'Live data refreshed' }); }
      } catch {
        try {
          const fallback = await fetch('/data/news.json');
          const payload = await fallback.json();
          if (!cancelled) { setData(payload); setLoadState({ status: 'cached', message: 'Showing cached data while refreshing globally' }); }
        } catch {
          if (!cancelled) setLoadState({ status: 'error', message: 'Unable to load dashboard data right now' });
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const items = data?.items || [];
  const market = data?.marketInsights || {};
  const forex = market.forexComparison || [];
  const stocks = market.stockOpportunities || [];
  const usStocks = market.usStockOpportunities || [];
  const selectedForex = forex.find(f => f.pair === forexPair) || forex[0];
  const selectedUsStock = usStocks.find(s => s.symbol === usTicker) || usStocks[0];
  const filtered = items.filter(i => (topic === 'All' || i.topic === topic) && (sentiment === 'All' || i.sentiment === sentiment));
  const topics = [...new Set(items.map(i => i.topic))];
  const sentimentData = ['Positive', 'Neutral', 'Negative'].map(s => ({
    name: s,
    value: items.filter(i => i.sentiment === s).length,
  }));
  const topicData = topics.map((t, idx) => ({
    topic: t,
    count: items.filter(i => i.topic === t).length,
    score: avg(items.filter(i => i.topic === t).map(i => i.score)),
    fill: topicColors[idx % topicColors.length],
  }));
  const momentum = items.map((i, idx) => ({
    name: i.topic.split(' ')[0],
    score: Number((i.score * 100).toFixed(0)),
    confidence: Number((i.confidence * 100).toFixed(0)),
  }));
  const positives = items.filter(i => i.sentiment === 'Positive').sort((a, b) => b.score - a.score);
  const risks = items.filter(i => i.sentiment === 'Negative').sort((a, b) => a.score - b.score);
  const avgScore = avg(items.map(i => i.score));

  if (!data && loadState.status === 'error') {
    return (
      <main className="statePage" role="alert">
        <div className="stateCard">
          <AlertTriangle size={24} />
          <h1>Dashboard data is unavailable</h1>
          <p>{loadState.message}. Check your connection, then reload this page.</p>
          <button type="button" onClick={() => window.location.reload()}>Reload dashboard</button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="statePage" aria-busy="true" aria-label="Loading dashboard">
        <div className="loadingShell"><span /><span /><span /></div>
      </main>
    );
  }

  return (
    <>
      <a className="skipLink" href="#dashboard-content">Skip to dashboard content</a>
      <nav className="topNav" aria-label="Primary navigation">
        <a className="brand" href="#overview" aria-label="Indonesia Intelligence home">
          <span className="brandMark">ID</span>
          <span>Indonesia Intelligence</span>
        </a>
        <div className="navLinks">
          <a href="#overview">Overview</a>
          <a href="#markets">Markets</a>
          <a href="#analytics">Analytics</a>
          <a href="#news">News feed</a>
        </div>
      </nav>
      <main id="dashboard-content">

      {/* ── Header ── */}
      <header className="hero" id="overview">
        <div>
          <p className="eyebrow"><Globe2 size={14} /> Indonesia intelligence dashboard</p>
          <h1>Indonesia intelligence, made actionable.</h1>
          <p className="subtitle">Daily briefing structured into analytics by topic, sentiment, confidence, and business/investment impact.</p>
        </div>
        <div className="heroPanel panel">
          <span>Generated</span>
          <strong>{formatDate(data.generatedAt)}</strong>
          <small>{data.sentimentBasis}</small>
          <em className={`sync ${loadState.status}`}>{loadState.message}</em>
        </div>
      </header>

      {/* ── Stats Row ── */}
      <section className="stats">
        <Stat icon={Newspaper} label="News items" value={items.length} hint="tracked today" />
        <Stat icon={TrendingUp} label="Avg sentiment" value={Math.round(avgScore * 100)} hint={`${scoreLabel(avgScore)} impact`} />
        <Stat icon={Radar} label="Topic coverage" value={topics.length} hint="segments active" />
        <Stat icon={AlertTriangle} label="Risk alerts" value={risks.length} hint="negative signals" />
      </section>

      {/* ── Forex Radar ── */}
      {forex.length > 0 && (
        <section className="grid two marketGrid" id="markets">
          <Card className="marketCard">
            <div className="feedHead">
              <div>
                <div className="sectionTitle"><TrendingUp size={16} /> IDR → global currency return radar</div>
                <p>{market.forexBasis}</p>
              </div>
              <div className="filters">
                <select value={selectedForex?.pair || ''} onChange={e => setForexPair(e.target.value)}>
                  {forex.map(f => <option key={f.pair} value={f.pair}>{f.pair}</option>)}
                </select>
              </div>
            </div>
            <div className="winner">
              <span>Most profitable from IDR now</span>
              <strong>{market.bestForex?.pair || selectedForex?.pair}</strong>
              <small>{market.bestForex?.label} · {market.bestForex?.view} · score {market.bestForex?.profitScore}</small>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={forex} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGridSub} />
                <XAxis dataKey="pair" stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
                <YAxis stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
                <Tooltip content={<CockpitTooltip />} />
                <Bar dataKey="profitScore" radius={[6, 6, 0, 0]}>
                  {forex.map((d, idx) => (
                    <Cell key={d.pair} fill={idx === 0 ? COLORS.positive : COLORS.accent} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="marketCard">
            <div className="sectionTitle"><Activity size={16} /> IDR exchanged to {selectedForex?.pair} — return trend</div>
            <p className="marketNote">
              Last IDR per 1 {selectedForex?.pair}: {money(selectedForex?.last)} · 1M return {pct(selectedForex?.return1m)} · 3M {pct(selectedForex?.return3m)} · 6M {pct(selectedForex?.return6m)} · vol {pct(selectedForex?.volatility)}
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={selectedForex?.sparkline || []} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="forexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGridSub} />
                <XAxis dataKey="date" stroke={COLORS.textMuted} tick={{ fontSize: 9, fontFamily: 'Geist Mono' }} />
                <YAxis stroke={COLORS.textMuted} domain={['dataMin', 'dataMax']} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
                <Tooltip content={<CockpitTooltip />} />
                <Line type="monotone" dataKey="value" stroke={COLORS.accentBright} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <blockquote className="marketQuote">{selectedForex?.useCase}</blockquote>
          </Card>
        </section>
      )}

      {/* ── Stock Screen ── */}
      {stocks.length > 0 && (
        <Card className="stockPanel">
          <div className="feedHead">
            <div>
              <div className="sectionTitle"><Radar size={16} /> Potential cuan stock screen — red IHSG mode</div>
              <p>{market.stockBasis}</p>
            </div>
          </div>
          <div className="stockGrid">
            {stocks.map(s => (
              <article key={s.code || s.ticker} className="stock">
                <div>
                  <b>{s.code || s.ticker}</b>
                  <span>{s.sector || s.theme}</span>
                </div>
                <strong>{s.opportunityScore}</strong>
                <p>{s.thesis || s.rationale}</p>
                <footer>
                  {s.last ? `Last Rp ${money(s.last)} · 1M ${pct(s.return1m)} · 3M ${pct(s.return3m)} · ` : ''}
                  {s.risk}
                </footer>
              </article>
            ))}
          </div>
          <p className="disclaimer">Analytical screening only, not financial advice. Re-check valuation, liquidity, corporate actions, and your risk profile before buying.</p>
        </Card>
      )}

      {/* US Market Opportunity Radar */}
      {usStocks.length > 0 && (
        <Card className="usMarketPanel">
          <div className="feedHead usMarketHead">
            <div>
              <div className="sectionTitle"><Globe2 size={16} /> US market opportunity radar</div>
              <p>{market.usStockBasis}</p>
            </div>
            <div className="filters">
              <select value={selectedUsStock?.symbol || ''} onChange={e => setUsTicker(e.target.value)} aria-label="Select US stock">
                {usStocks.map(stock => <option key={stock.symbol} value={stock.symbol}>{stock.symbol} - {stock.name}</option>)}
              </select>
            </div>
          </div>

          <div className="usTerminal">
            <div className="usChartPane">
              <div className="tickerStrip">
                <div><b>{selectedUsStock?.symbol}</b><span>{selectedUsStock?.name}</span></div>
                <strong>${money(selectedUsStock?.last)}</strong>
                <span className={(selectedUsStock?.return1m || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(selectedUsStock?.return1m)} 1M</span>
                <a href={selectedUsStock?.tradingViewUrl} target="_blank" rel="noreferrer">Open TradingView <ArrowUpRight size={13} /></a>
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={selectedUsStock?.sparkline || []} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="usPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accentBright} stopOpacity={0.32} />
                      <stop offset="95%" stopColor={COLORS.accentBright} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke={COLORS.chartGridSub} />
                  <XAxis dataKey="date" stroke={COLORS.textMuted} minTickGap={44} tick={{ fontSize: 9, fontFamily: 'Geist Mono' }} />
                  <YAxis orientation="right" stroke={COLORS.textMuted} domain={['auto', 'auto']} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
                  <Tooltip content={<CockpitTooltip />} />
                  <Area type="monotone" dataKey="value" name="USD" stroke={COLORS.accentBright} strokeWidth={2} fill="url(#usPriceGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="usMetrics">
                <span>1M <b className={(selectedUsStock?.return1m || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(selectedUsStock?.return1m)}</b></span>
                <span>3M <b className={(selectedUsStock?.return3m || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(selectedUsStock?.return3m)}</b></span>
                <span>6M <b className={(selectedUsStock?.return6m || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(selectedUsStock?.return6m)}</b></span>
                <span>1Y <b className={(selectedUsStock?.return1y || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(selectedUsStock?.return1y)}</b></span>
                <span>Volatility <b>{pct(selectedUsStock?.volatility)}</b></span>
                <span>Max drawdown <b className="marketDown">{pct(selectedUsStock?.maxDrawdown)}</b></span>
              </div>
            </div>

            <aside className="usLeaderboard">
              <div className="leaderboardHead"><span>Current ranking</span><b>Score</b></div>
              {usStocks.slice(0, 8).map((stock, index) => (
                <button key={stock.symbol} className={selectedUsStock?.symbol === stock.symbol ? 'active' : ''} onClick={() => setUsTicker(stock.symbol)}>
                  <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="tickerName"><b>{stock.symbol}</b><small>{stock.sector}</small></span>
                  <span className={(stock.return3m || 0) >= 0 ? 'marketUp' : 'marketDown'}>{pct(stock.return3m)}</span>
                  <strong>{stock.opportunityScore}</strong>
                </button>
              ))}
            </aside>
          </div>

          <div className="usThesis">
            <div><span>Quant screen leader</span><strong>{market.bestUsStock?.symbol} at {market.bestUsStock?.opportunityScore}</strong></div>
            <p><b>{selectedUsStock?.risk} risk.</b> {selectedUsStock?.thesis}</p>
            <small>Prices are delayed end-of-day observations in USD. Rankings use price history only and exclude valuation, earnings revisions, dividends, taxes, FX conversion, and transaction costs. This is not financial advice and does not guarantee profit.</small>
          </div>
        </Card>
      )}

      {/* ── Sentiment Mix + Topic Impact ── */}
      <section className="grid two" id="analytics">
        <Card>
          <div className="sectionTitle"><BarChart3 size={16} /> Sentiment mix</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {sentimentData.map(d => (
                  <Cell key={d.name} fill={sentimentColors[d.name]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CockpitTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="sectionTitle"><Activity size={16} /> Topic impact score</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topicData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGridSub} />
              <XAxis dataKey="topic" stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
              <YAxis stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
              <Tooltip content={<CockpitTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {topicData.map(d => <Cell key={d.topic} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* ── Signal Confidence + Opp/Risk ── */}
      <section className="grid two">
        <Card>
          <div className="sectionTitle"><TrendingUp size={16} /> Signal confidence</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={momentum} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGridSub} />
              <XAxis dataKey="name" stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
              <YAxis stroke={COLORS.textMuted} tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
              <Tooltip content={<CockpitTooltip />} />
              <Area dataKey="confidence" stroke={COLORS.accentBright} strokeWidth={2} fill="url(#confGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="sectionTitle"><ArrowUpRight size={16} /> Opportunity vs risk</div>
          <div className="split">
            <div>
              <h3>Opportunity</h3>
              {positives.slice(0, 8).map(i => <Mini key={i.id} item={i} />)}
              {positives.length === 0 && <p className="compactEmpty">No positive-impact signals in the current briefing.</p>}
            </div>
            <div>
              <h3>Risk</h3>
              {risks.slice(0, 8).map(i => <Mini key={i.id} item={i} />)}
              {risks.length === 0 && <p className="compactEmpty">No negative-impact signals in the current briefing.</p>}
            </div>
          </div>
        </Card>
      </section>

      {/* ── Intelligence Feed ── */}
      <Card className="feedPanel" id="news">
        <div className="feedHead">
          <div>
            <div className="sectionTitle"><Newspaper size={16} /> Intelligence feed</div>
            <p>Filter by topic or sentiment. Each item keeps the executive "why it matters" layer.</p>
          </div>
          <div className="filters">
            <select value={topic} onChange={e => setTopic(e.target.value)}>
              <option>All</option>
              {topics.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={sentiment} onChange={e => setSentiment(e.target.value)}>
              <option>All</option>
              <option>Positive</option>
              <option>Neutral</option>
              <option>Negative</option>
            </select>
          </div>
        </div>
        <div className="feed" aria-live="polite">
          {filtered.map(item => (
            <article className="news" key={item.id}>
              {validImageUrl(item.imageUrl) && (
                <a className="newsImage" href={item.sourceUrl || item.imageUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${item.title}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => { event.currentTarget.closest('.newsImage')?.classList.add('broken'); }}
                  />
                </a>
              )}
              <div className="news-meta">
                <span className="tag">{item.topic}</span>
                <span
                  className="pill"
                  style={{ borderColor: sentimentColors[item.sentiment], color: sentimentColors[item.sentiment] }}
                >
                  {item.sentiment} · {(item.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <h2><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={15} aria-hidden="true" /></a></h2>
              <p>{item.summary}</p>
              <blockquote>{item.impact}</blockquote>
              <footer>{item.source} · score {(item.score * 100).toFixed(0)}</footer>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="emptyState">
              <Newspaper size={22} />
              <h2>No signals match these filters</h2>
              <p>Choose a different topic or sentiment to restore the intelligence feed.</p>
            </div>
          )}
        </div>
      </Card>
      </main>
    </>
  );
}

/* ── PWA Registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('PWA service worker registration failed', error);
    });
  });
}

createRoot(document.getElementById('root')).render(<App />);
