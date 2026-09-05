import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileWarning,
  Globe2,
  HeartPulse,
  Home,
  Moon,
  Newspaper,
  Plane,
  ShieldCheck,
  Sun,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import '@fontsource/geist-sans/latin-400.css';
import '@fontsource/geist-sans/latin-600.css';
import '@fontsource/geist-sans/latin-700.css';
import '@fontsource/geist-mono/latin-400.css';
import '@fontsource/geist-mono/latin-600.css';
import '@fontsource/geist-mono/latin-700.css';
import './styles.css';
import './reference-theme.css';
import './weekly.css';

const SENTIMENT_COLORS = {
  Positive: '#047857',
  Neutral: '#a16207',
  Negative: '#dc2626',
  'No coverage': '#94a3b8',
};
const STATUS_ICONS = {
  monitor: ShieldCheck,
  prepare: FileWarning,
  act: AlertTriangle,
};
const CONFIDENCE_LABELS = { Low: 'Rendah', Medium: 'Sedang' };
const TRIGGER_LABELS = { Stable: 'Stabil', Check: 'Periksa', Plan: 'Rencanakan', Unknown: 'Data kurang' };
const TRIGGER_ICONS = [BriefcaseBusiness, ShieldCheck, HeartPulse, Home];
const REFRESH_MS = 5 * 60 * 1000;

function formatDateTime(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value)) + ' WIB';
}

function formatShortDay(value) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function percentScore(value) {
  return `${value >= 0 ? '+' : ''}${Math.round(Number(value || 0) * 100)}`;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="themeToggle"
      type="button"
      aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
      title={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
      onClick={onToggle}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
    </button>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="weeklyTooltip">
      {label && <strong>{label}</strong>}
      {payload.map(entry => (
        <span key={`${entry.name}-${entry.value}`}>
          <i style={{ background: entry.color }} />
          {entry.name}: {entry.name === 'score' ? percentScore(entry.value) : entry.value}
        </span>
      ))}
    </div>
  );
}

function StatePage({ status, message }) {
  if (status === 'loading') {
    return (
      <main className="statePage" aria-busy="true" aria-label="Memuat laporan mingguan">
        <div className="loadingShell"><span /><span /><span /></div>
      </main>
    );
  }
  return (
    <main className="statePage" role="alert">
      <div className="stateCard">
        <AlertTriangle size={24} />
        <h1>Laporan mingguan belum tersedia</h1>
        <p>{message}</p>
        <button type="button" onClick={() => window.location.reload()}>Muat ulang</button>
      </div>
    </main>
  );
}

function StatusPanel({ report }) {
  const { status, metrics } = report;
  const StatusIcon = STATUS_ICONS[status.level] || CircleHelp;
  const sentimentBars = [
    { name: 'Positif', value: metrics.positive, color: SENTIMENT_COLORS.Positive },
    { name: 'Netral', value: metrics.neutral, color: SENTIMENT_COLORS.Neutral },
    { name: 'Negatif', value: metrics.negative, color: SENTIMENT_COLORS.Negative },
  ];
  const total = Math.max(1, metrics.articles);

  return (
    <section className={`weeklyStatus ${status.level} ${status.dataSufficiency === 'Insufficient' ? 'insufficient' : ''}`} aria-labelledby="weekly-status-title">
      <div className="statusDecision">
        <div className="statusIcon"><StatusIcon size={26} /></div>
        <div>
          <span className="statusLabel">Status keputusan minggu ini <b>{status.dataQualifier}</b></span>
          <h2 id="weekly-status-title">{status.label}</h2>
          <p>{status.summary}</p>
        </div>
        <div className="conditionIndex" aria-label={status.dataSufficiency === 'Insufficient' ? 'Indeks kondisi ditahan karena data belum cukup' : `Indeks kondisi ${status.conditionIndex} dari 100`}>
          <strong>{status.dataSufficiency === 'Insufficient' ? '—' : status.conditionIndex}</strong>
          <span>{status.dataSufficiency === 'Insufficient' ? '' : '/100'}</span>
          <small>0 tekanan kuat<br />100 lebih suportif</small>
        </div>
      </div>

      <div className="evidenceStrip">
        <div><strong>{metrics.articles}</strong><span>berita dianalisis</span></div>
        <div><strong>{metrics.sources}</strong><span>sumber berbeda</span></div>
        <div><strong>{metrics.categoriesCovered}/{metrics.categoriesTracked}</strong><span>bidang terliput</span></div>
        <div><strong>{CONFIDENCE_LABELS[status.confidence] || status.confidence}</strong><span>keyakinan sinyal</span></div>
      </div>

      <div className="sentimentComposition" aria-label="Komposisi sentimen">
        {sentimentBars.map(item => (
          <div
            key={item.name}
            style={{ width: `${Math.max(item.value ? 3 : 0, (item.value / total) * 100)}%`, background: item.color }}
            title={`${item.name}: ${item.value}`}
          />
        ))}
      </div>
      <div className="sentimentLegend">
        {sentimentBars.map(item => <span key={item.name}><i style={{ background: item.color }} />{item.name} {item.value}</span>)}
      </div>
      <p className="statusCaveat"><CircleHelp size={15} />{status.caveat}</p>
    </section>
  );
}

function TrendPanel({ report }) {
  const trend = report.dailyTrend.map(row => ({ ...row, day: formatShortDay(row.date), score: row.score == null ? null : Math.round(row.score * 100) }));
  const trendBound = Math.max(20, Math.ceil(Math.max(...trend.map(row => Math.abs(row.score || 0)), 0) / 10) * 10);
  return (
    <section className="weeklyCard trendPanel" aria-labelledby="trend-title">
      <div className="weeklySectionHead">
        <div>
          <h2 id="trend-title">Pergerakan sentimen tujuh hari</h2>
          <p>Skor tertimbang per hari. Garis nol memisahkan tekanan negatif dan dukungan positif.</p>
        </div>
        <TrendingUp size={20} />
      </div>
      <div className="chartVisual" role="img" aria-describedby="trend-data" aria-label="Grafik tren sentimen tujuh hari">
        <ResponsiveContainer width="100%" height={290}>
          <LineChart data={trend} margin={{ top: 12, right: 18, bottom: 4, left: -18 }}>
            <CartesianGrid strokeDasharray="3 5" stroke="var(--chart-grid-subtle)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'Geist Mono' }} />
            <YAxis domain={[-trendBound, trendBound]} stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
            <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="score" name="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div id="trend-data" className="srOnly">{trend.map(row => `${row.day}: ${row.articles} berita, ${row.score == null ? 'tidak ada liputan' : `skor ${row.score}`}`).join('; ')}</div>
    </section>
  );
}

function TopicPanel({ report }) {
  const data = report.topicScores.map(row => ({
    ...row,
    shortTopic: row.topic.replace(' & ', ' / '),
    scoreDisplay: Math.round(row.score * 100),
  }));
  return (
    <section className="weeklyCard topicPanel" aria-labelledby="topics-title">
      <div className="weeklySectionHead">
        <div>
          <h2 id="topics-title">Tekanan dan dukungan per bidang</h2>
          <p>Bidang tanpa berita kredibel ditandai sebagai celah data, bukan dianggap netral.</p>
        </div>
        <Newspaper size={20} />
      </div>
      <div className="chartVisual topicChart" role="img" aria-describedby="topic-data" aria-label="Grafik tekanan dan dukungan per bidang">
        <ResponsiveContainer width="100%" height={430}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, bottom: 0, left: 24 }}>
            <CartesianGrid strokeDasharray="3 5" horizontal={false} stroke="var(--chart-grid-subtle)" />
            <XAxis type="number" domain={[-100, 100]} stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'Geist Mono' }} />
            <YAxis dataKey="shortTopic" type="category" width={126} stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'Geist Sans' }} />
            <ReferenceLine x={0} stroke="var(--text-muted)" />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="scoreDisplay" name="score" radius={[0, 6, 6, 0]} minPointSize={3}>
              {data.map(row => <Cell key={row.topic} fill={SENTIMENT_COLORS[row.sentiment] || SENTIMENT_COLORS['No coverage']} opacity={row.count ? 1 : 0.45} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div id="topic-data" className="srOnly">{data.map(row => `${row.topic}: ${row.count} berita, ${row.count ? `skor ${row.scoreDisplay}` : 'tidak terliput'}`).join('; ')}</div>
      <div className="topicScoreList" aria-label="Daftar skor sentimen per bidang">
        {data.map(row => (
          <div key={row.topic}>
            <i style={{ background: SENTIMENT_COLORS[row.sentiment] || SENTIMENT_COLORS['No coverage'] }} />
            <span>{row.topic}<small>{row.count ? `${row.count} berita` : 'Tidak terliput'}</small></span>
            <strong>{row.count ? percentScore(row.score) : 'N/A'}</strong>
          </div>
        ))}
      </div>
      <div className="coverageGaps">
        <b>Celah liputan:</b>{' '}
        {data.filter(row => row.count === 0).map(row => row.topic).join(', ') || 'Tidak ada pada minggu ini.'}
      </div>
    </section>
  );
}

function Drivers({ report }) {
  if (!report.status.drivers.length) return null;
  return (
    <section className="driverBand" aria-label="Penggerak status mingguan">
      {report.status.drivers.map(driver => (
        <div key={`${driver.kind}-${driver.topic}`} className={driver.kind}>
          {driver.kind === 'pressure' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
          <span>{driver.kind === 'pressure' ? 'Tekanan' : 'Dukungan'}</span>
          <strong>{driver.topic}</strong>
          <b>{percentScore(driver.score)}</b>
        </div>
      ))}
    </section>
  );
}

function Highlights({ report }) {
  return (
    <section className="highlightsSection" id="highlights" aria-labelledby="highlights-title">
      <div className="weeklySectionHead editorialHead">
        <div>
          <h2 id="highlights-title">Berita yang paling memengaruhi minggu ini</h2>
          <p>Dipilih dari kekuatan sentimen, kepentingan bidang, kebaruan, dan kredibilitas sumber.</p>
        </div>
      </div>
      <div className="highlightsGrid">
        {report.highlights.map((item, index) => (
          <article className="highlightItem" key={item.id}>
            <span className="highlightRank">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <div className="highlightMeta">
                <span>{item.topic}</span>
                <b style={{ color: SENTIMENT_COLORS[item.sentiment] }}>{item.sentiment} {percentScore(item.score)}</b>
              </div>
              <h3><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={15} /></a></h3>
              <footer>{item.source} · {item.date}</footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DecisionTriggers({ report }) {
  return (
    <section className="weeklyCard triggersPanel" id="triggers" aria-labelledby="triggers-title">
      <div className="weeklySectionHead">
        <div>
          <h2 id="triggers-title">Pemicu yang perlu diperiksa bersama pasangan</h2>
          <p>Gunakan indikator lokal dan kondisi keluarga untuk melengkapi sinyal berita nasional.</p>
        </div>
        <ShieldCheck size={20} />
      </div>
      <div className="triggerList">
        {report.decisionTriggers.map((trigger, index) => {
          const Icon = TRIGGER_ICONS[index] || CheckCircle2;
          return (
            <article key={trigger.title}>
              <Icon size={19} />
              <div><h3>{trigger.title}</h3><p>{trigger.instruction}</p></div>
              <span className={trigger.state.toLowerCase()}>{TRIGGER_LABELS[trigger.state] || trigger.state}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RelocationRadar({ report }) {
  return (
    <section className="relocationSection" id="relocation" aria-labelledby="relocation-title">
      <div className="relocationIntro">
        <Plane size={26} />
        <h2 id="relocation-title">Radar persiapan relokasi</h2>
        <p>Perbandingan awal, bukan peringkat negara. Mulai dari jalur kerja resmi, kelayakan tanggungan, kesehatan, bahasa, dan biaya transisi.</p>
      </div>
      <div className="countryList">
        {report.relocationRadar.map(country => (
          <article key={country.country}>
            <header><Globe2 size={18} /><h3>{country.country}</h3></header>
            <dl>
              <div><dt>Karier</dt><dd>{country.careerSignal}</dd></div>
              <div><dt>Keluarga</dt><dd>{country.familySignal}</dd></div>
              <div><dt>Periksa dulu</dt><dd>{country.planningFocus}</dd></div>
            </dl>
            <a href={country.officialUrl} target="_blank" rel="noreferrer">{country.officialLabel}<ArrowUpRight size={14} /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Methodology({ report }) {
  return (
    <details className="methodology weeklyCard" id="methodology">
      <summary><span><CircleHelp size={18} />Cara membaca skor dan batasannya</span><ChevronDown size={18} /></summary>
      <div>
        <p><b>Sentimen.</b> {report.methodology.sentiment}</p>
        <p><b>Status.</b> {report.methodology.status}</p>
        <p><b>Batasan.</b> {report.methodology.limitations}</p>
        {report.methodology.queryErrors?.length > 0 && <p><b>Gangguan koleksi.</b> {report.methodology.queryErrors.join('; ')}</p>}
      </div>
    </details>
  );
}

function App() {
  const [report, setReport] = useState(null);
  const [archives, setArchives] = useState([]);
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' });
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [selectedReport, setSelectedReport] = useState('/data/weekly.json');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('indonesia-intel-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1120' : '#ffffff');
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadState(current => current.status === 'ready' ? current : { status: 'loading', message: '' });
      try {
        const [reportResponse, archiveResponse] = await Promise.all([
          fetch(`${selectedReport}?v=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/data/weekly/index.json?v=${Date.now()}`, { cache: 'no-store' }),
        ]);
        if (!reportResponse.ok) throw new Error(`HTTP ${reportResponse.status}`);
        const payload = await reportResponse.json();
        const archivePayload = archiveResponse.ok ? await archiveResponse.json() : { reports: [] };
        const archiveWarning = archiveResponse.ok
          ? ''
          : `Laporan dimuat, tetapi riwayat arsip tidak tersedia (HTTP ${archiveResponse.status}).`;
        if (!cancelled) {
          setReport(payload);
          setArchives(archivePayload.reports || []);
          setLoadState(archiveWarning
            ? { status: 'warning', message: archiveWarning }
            : { status: 'ready', message: `Laporan periode ${payload.period.label} berhasil dimuat.` });
        }
      } catch {
        if (!cancelled) setLoadState({ status: 'error', message: 'Data tidak dapat dimuat. Periksa koneksi lalu coba lagi.' });
      }
    };
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selectedReport]);

  if (!report) return <StatePage status={loadState.status} message={loadState.message} />;

  return (
    <>
      <a className="skipLink" href="#weekly-content">Lewati ke isi laporan</a>
      <nav className="topNav weeklyNav" aria-label="Navigasi utama">
        <a className="brand" href="/" aria-label="Beranda Indonesia Intelligence">
          <span className="brandMark">ID</span>
          <span>Indonesia Intelligence</span>
        </a>
        <div className="navActions">
          <div className="navLinks">
            <a href="/"><ArrowLeft size={14} />Harian</a>
            <a href="/weekly/" aria-current="page">Mingguan</a>
            <a href="#highlights">Sorotan</a>
            <a href="#relocation">Relokasi</a>
          </div>
          <ThemeToggle theme={theme} onToggle={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        </div>
      </nav>

      <main id="weekly-content" className="weeklyMain" aria-busy={loadState.status === 'loading'}>
        <div className="srOnly" role="status" aria-live="polite">{loadState.message}</div>
        {loadState.status === 'warning' && (
          <div className="archiveWarning" role="status"><AlertTriangle size={16} />{loadState.message}</div>
        )}
        <header className="weeklyHeader">
          <div>
            <div className="weeklyTitleLine"><CalendarDays size={18} /><span>Ringkasan mingguan</span></div>
            <h1>Indonesia, dilihat untuk keputusan keluarga.</h1>
            <p>Berita lintas bidang diringkas menjadi sinyal yang bisa diperiksa, bukan ramalan atau pemicu panik.</p>
          </div>
          <div className="periodControl">
            <label htmlFor="weekly-archive">Periode laporan</label>
            <select id="weekly-archive" value={selectedReport} onChange={event => { setReport(null); setLoadState({ status: 'loading', message: 'Memuat periode yang dipilih' }); setSelectedReport(event.target.value); }}>
              <option value="/data/weekly.json">Laporan terbaru</option>
              {archives.map(item => (
                <option key={item.url} value={item.url}>{item.periodLabel}</option>
              ))}
            </select>
            <small>Dibuat {formatDateTime(report.generatedAt)}</small>
          </div>
        </header>

        <StatusPanel report={report} />
        <Drivers report={report} />
        <section className="weeklyGrid">
          <TrendPanel report={report} />
          <TopicPanel report={report} />
        </section>
        <Highlights report={report} />
        <DecisionTriggers report={report} />
        <RelocationRadar report={report} />
        <Methodology report={report} />
      </main>
    </>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {}));
}

createRoot(document.getElementById('root')).render(<App />);
