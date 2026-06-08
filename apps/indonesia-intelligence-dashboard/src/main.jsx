import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, Globe2, Newspaper, Radar, TrendingUp } from 'lucide-react';
import './styles.css';

const sentimentColors = { Positive: '#22c55e', Neutral: '#f59e0b', Negative: '#ef4444' };
const topicColors = ['#38bdf8','#a78bfa','#34d399','#f97316','#f43f5e','#eab308','#2dd4bf','#818cf8','#fb7185'];
const blockedImageTokens = ['google_news_', 'favicon', 'sprite', 'pixel', 'logo', 'J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc'];
function validImageUrl(url='') { return url.startsWith('https://') && !blockedImageTokens.some(token => url.toLowerCase().includes(token.toLowerCase())); }

function Card({children, className=''}) { return <section className={`card ${className}`}>{children}</section>; }
function Stat({icon: Icon, label, value, hint}) { return <Card><div className="stat"><div className="icon"><Icon size={20}/></div><div><p>{label}</p><strong>{value}</strong><span>{hint}</span></div></div></Card>; }

function App(){
  const [data,setData]=useState(null); const [topic,setTopic]=useState('All'); const [sentiment,setSentiment]=useState('All');
  const [loadState,setLoadState]=useState({status:'loading', message:''});
  useEffect(()=>{
    let cancelled=false;
    const load = async () => {
      try {
        const response = await fetch(`/data/news.json?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!cancelled) { setData(payload); setLoadState({status:'live', message:'Live data refreshed'}); }
      } catch (error) {
        try {
          const fallback = await fetch('/data/news.json');
          const payload = await fallback.json();
          if (!cancelled) { setData(payload); setLoadState({status:'cached', message:'Showing cached data while refreshing globally'}); }
        } catch (fallbackError) {
          if (!cancelled) setLoadState({status:'error', message:'Unable to load dashboard data right now'});
        }
      }
    };
    load();
    return () => { cancelled=true; };
  },[]);
  const items=data?.items||[];
  const filtered=items.filter(i=>(topic==='All'||i.topic===topic)&&(sentiment==='All'||i.sentiment===sentiment));
  const topics=[...new Set(items.map(i=>i.topic))];
  const sentimentData=['Positive','Neutral','Negative'].map(s=>({name:s,value:items.filter(i=>i.sentiment===s).length,avg:avg(items.filter(i=>i.sentiment===s).map(i=>i.score))}));
  const topicData=topics.map((t,idx)=>({topic:t,count:items.filter(i=>i.topic===t).length,score:avg(items.filter(i=>i.topic===t).map(i=>i.score)),fill:topicColors[idx%topicColors.length]}));
  const momentum=items.map((i,idx)=>({name:i.topic.split(' ')[0],score:Number((i.score*100).toFixed(0)),confidence:Number((i.confidence*100).toFixed(0))}));
  const positives=items.filter(i=>i.sentiment==='Positive').sort((a,b)=>b.score-a.score);
  const risks=items.filter(i=>i.sentiment==='Negative').sort((a,b)=>a.score-b.score);
  const avgScore=avg(items.map(i=>i.score));
  if(!data) return <div className="loading">Loading Indonesia intelligence dashboard...</div>;
  return <main>
    <div className="orb orb1"/><div className="orb orb2"/>
    <header className="hero">
      <div>
        <p className="eyebrow"><Globe2 size={16}/> Indonesia intelligence dashboard</p>
        <h1>News sentiment, topic momentum, and executive market signals.</h1>
        <p className="subtitle">Daily briefing converted into structured analytics by topic, sentiment, confidence, and business/investment impact.</p>
      </div>
      <div className="heroPanel"><span>Generated</span><strong>{formatDate(data.generatedAt)}</strong><small>{data.sentimentBasis}</small><em className={`sync ${loadState.status}`}>{loadState.message}</em></div>
    </header>

    <section className="stats">
      <Stat icon={Newspaper} label="News items" value={items.length} hint="tracked today"/>
      <Stat icon={TrendingUp} label="Avg sentiment" value={scoreLabel(avgScore)} hint={`${(avgScore*100).toFixed(0)} impact score`}/>
      <Stat icon={Radar} label="Topic coverage" value={topics.length} hint="segments active"/>
      <Stat icon={AlertTriangle} label="Risk alerts" value={risks.length} hint="negative signals"/>
    </section>

    <section className="grid two">
      <Card><div className="sectionTitle"><BarChart3/> Sentiment mix</div><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>{sentimentData.map(d=><Cell key={d.name} fill={sentimentColors[d.name]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></Card>
      <Card><div className="sectionTitle"><Activity/> Topic impact score</div><ResponsiveContainer width="100%" height={280}><BarChart data={topicData}><CartesianGrid strokeDasharray="3 3" stroke="#26324a"/><XAxis dataKey="topic" stroke="#94a3b8" tick={{fontSize:11}}/><YAxis stroke="#94a3b8"/><Tooltip/><Bar dataKey="score" radius={[8,8,0,0]}>{topicData.map(d=><Cell key={d.topic} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></Card>
    </section>

    <section className="grid two">
      <Card><div className="sectionTitle"><TrendingUp/> Signal confidence</div><ResponsiveContainer width="100%" height={260}><AreaChart data={momentum}><defs><linearGradient id="c" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#26324a"/><XAxis dataKey="name" stroke="#94a3b8"/><YAxis stroke="#94a3b8"/><Tooltip/><Area dataKey="confidence" stroke="#38bdf8" fill="url(#c)"/></AreaChart></ResponsiveContainer></Card>
      <Card><div className="sectionTitle"><ArrowUpRight/> Opportunity vs risk</div><div className="split"><div><h3>Opportunity</h3>{positives.map(i=><Mini key={i.id} item={i}/>)}</div><div><h3>Risk</h3>{risks.map(i=><Mini key={i.id} item={i}/>)}</div></div></Card>
    </section>

    <Card>
      <div className="feedHead"><div><div className="sectionTitle"><Newspaper/> Intelligence feed</div><p>Filter by topic or sentiment. Each item keeps the executive “why it matters” layer.</p></div><div className="filters"><select value={topic} onChange={e=>setTopic(e.target.value)}><option>All</option>{topics.map(t=><option key={t}>{t}</option>)}</select><select value={sentiment} onChange={e=>setSentiment(e.target.value)}><option>All</option><option>Positive</option><option>Neutral</option><option>Negative</option></select></div></div>
      <div className="feed">{filtered.map(item=><article className="news" key={item.id}>{validImageUrl(item.imageUrl) && <a className="newsImage" href={item.sourceUrl || item.imageUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${item.title}`}><img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" referrerPolicy="no-referrer" onError={(event)=>{ event.currentTarget.closest('.newsImage')?.classList.add('broken'); }}/></a>}<div><span className="tag">{item.topic}</span><span className="pill" style={{borderColor:sentimentColors[item.sentiment],color:sentimentColors[item.sentiment]}}>{item.sentiment} · {(item.confidence*100).toFixed(0)}%</span></div><h2>{item.title}</h2><p>{item.summary}</p><blockquote>{item.impact}</blockquote><footer>{item.source} · score {(item.score*100).toFixed(0)}</footer></article>)}</div>
    </Card>
  </main>
}
function Mini({item}){ return <div className="mini"><b>{item.topic}</b><span>{item.title}</span></div> }
function avg(arr){ return arr.length? arr.reduce((a,b)=>a+b,0)/arr.length:0 }
function scoreLabel(s){ if(s>0.2) return 'Positive'; if(s<-0.2) return 'Negative'; return 'Neutral'; }
function formatDate(s){ return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(s))+' WIB'; }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('PWA service worker registration failed', error);
    });
  });
}

createRoot(document.getElementById('root')).render(<App/>);
